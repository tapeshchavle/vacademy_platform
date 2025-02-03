
import { create } from "zustand"
import { Storage } from "@capacitor/storage"
import type { Assessment, Question, QuestionState } from "../types/assessment"

interface SectionTimer {
  timeLeft: number
  isRunning: boolean
  hasStarted: boolean
}

interface AssessmentStore {
  assessment: Assessment | null
  currentSection: number
  currentQuestion: Question | null
  questionStates: Record<string, QuestionState>
  answers: Record<string, string[]>
  sectionTimers: Record<number, SectionTimer>
  questionTimers: Record<string, number>
  setAssessment: (assessment: Assessment) => void
  setCurrentSection: (sectionIndex: number) => void
  setCurrentQuestion: (question: Question) => void
  setQuestionState: (questionId: string, state: Partial<QuestionState>) => void
  setAnswer: (questionId: string, answerId: string[]) => void
  markForReview: (questionId: string) => void
  clearResponse: (questionId: string) => void
  updateSectionTimer: (sectionIndex: number, timeLeft: number) => void
  updateQuestionTimer: (questionId: string, timeLeft: number) => void
  toggleSectionTimer: (sectionIndex: number, isRunning: boolean) => void
  isSubmitted: boolean
  submitAssessment: () => void
  findNextAvailableSection: () => number | null
  moveToNextAvailableSection: () => void
  moveToNextQuestion: () => void
  entireTestTimer: number
  setEntireTestTimer: (time: number) => void
  updateEntireTestTimer: () => void
  isSectionComplete: (sectionIndex: number) => boolean
  isSectionAvailable: (sectionIndex: number) => boolean
  tabSwitchCount: number
  incrementTabSwitchCount: () => void
  saveState: () => Promise<void>
  loadState: () => Promise<void>
  questionStartTime: Record<string, number>
  setQuestionStartTime: (questionId: string, startTime: number) => void
  calculateTimeTaken: (questionId: string) => number
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  assessment: null,
  currentSection: 0,
  currentQuestion: null,
  questionStates: {},
  answers: {},
  sectionTimers: {},
  questionTimers: {},

  setAssessment: (assessment) =>
    set((state) => {
      if (!assessment || !assessment.sections) {
        console.error("Invalid assessment object:", assessment)
        return state
      }

      const questionStates: Record<string, QuestionState> = {}
      const sectionTimers: Record<number, SectionTimer> = {}
      const questionTimers: Record<string, number> = {}
      const questionStartTime: Record<string, number> = {}

      assessment.sections.forEach((section, index) => {
        if (assessment.testDuration.sectionWiseDuration) {
          const [minutes, seconds] = section.sectionDuration.split(":").map(Number)
          sectionTimers[index] = {
            timeLeft: (minutes * 60 + seconds) * 1000,
            isRunning: !assessment.canSwitchSections ? index === 0 : false,
            hasStarted: index === 0,
          }
        }

        section.questions.forEach((question) => {
          questionStates[question.questionId] = {
            isAnswered: false,
            isVisited: false,
            isMarkedForReview: false,
            isDisabled: false,
          }

          if (assessment.testDuration.questionWiseDuration && question.questionDuration) {
            const [minutes, seconds] = question.questionDuration.split(":").map(Number)
            questionTimers[question.questionId] = (minutes * 60 + seconds) * 1000
          }
        })
      })

      // const [hours, minutes] = assessment.testDuration.entireTestDuration
      const entireTestTimer = assessment.testDuration.entireTestDuration * 60 

      return {
        assessment,
        questionStates,
        sectionTimers,
        questionTimers,
        entireTestTimer,
        currentSection: 0,
        questionStartTime,
      }
    }),

  setCurrentSection: (sectionIndex) =>
    set((state) => {
      if (!state.assessment) return {}

      if (!state.assessment.canSwitchSections) {
        const previousSectionsComplete = [...Array(sectionIndex)].every(
          (_, idx) => state.sectionTimers[idx]?.timeLeft === 0,
        )
        if (!previousSectionsComplete) return {}
      }

      const updatedTimers = { ...state.sectionTimers }
      Object.keys(updatedTimers).forEach((key) => {
        const idx = Number(key)
        if (!state.assessment?.canSwitchSections) {
          updatedTimers[idx].isRunning = idx === sectionIndex
        }
      })

      return {
        currentSection: sectionIndex,
        sectionTimers: updatedTimers,
      }
    }),

  setCurrentQuestion: (question) =>
    set((state) => ({
      currentQuestion: question,
      questionStates: {
        ...state.questionStates,
        [question.questionId]: {
          ...state.questionStates[question.questionId],
          isVisited: true,
        },
      },
      questionStartTime: {
        ...state.questionStartTime,
        [question.questionId]: Date.now(),
      },
    })),

  setQuestionState: (questionId, state) =>
    set((prevState) => ({
      questionStates: {
        ...prevState.questionStates,
        [questionId]: { ...prevState.questionStates[questionId], ...state },
      },
    })),

  setAnswer: (questionId, answerIds) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerIds },
      questionStates: {
        ...state.questionStates,
        [questionId]: {
          ...state.questionStates[questionId],
          isAnswered: answerIds.length > 0,
        },
      },
    })),

  markForReview: (questionId) =>
    set((state) => ({
      questionStates: {
        ...state.questionStates,
        [questionId]: {
          ...state.questionStates[questionId],
          isMarkedForReview: !state.questionStates[questionId].isMarkedForReview,
        },
      },
    })),

  clearResponse: (questionId) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: [] },
      questionStates: {
        ...state.questionStates,
        [questionId]: {
          ...state.questionStates[questionId],
          isAnswered: false,
        },
      },
    })),

  updateSectionTimer: (sectionIndex, timeLeft) =>
    set((state) => {
      if (!state.assessment?.testDuration.sectionWiseDuration) {
        return {}
      }

      const updatedTimers = {
        ...state.sectionTimers,
        [sectionIndex]: {
          ...state.sectionTimers[sectionIndex],
          timeLeft,
        },
      }

      if (timeLeft === 0 && sectionIndex === state.currentSection) {
        const nextSectionIndex = state.findNextAvailableSection()
        if (nextSectionIndex !== null) {
          updatedTimers[nextSectionIndex].isRunning = true
          const firstQuestion = state.assessment?.sections[nextSectionIndex].questions[0]

          return {
            sectionTimers: updatedTimers,
            currentSection: nextSectionIndex,
            currentQuestion: firstQuestion,
          }
        } else {
          if (state.entireTestTimer <= 0) {
            return {
              sectionTimers: updatedTimers,
              isSubmitted: true,
            }
          }
        }
      }

      return { sectionTimers: updatedTimers }
    }),

  updateQuestionTimer: (questionId, timeLeft) =>
    set((state) => ({
      questionTimers: {
        ...state.questionTimers,
        [questionId]: timeLeft,
      },
    })),

  toggleSectionTimer: (sectionIndex, isRunning) =>
    set((state) => ({
      sectionTimers: {
        ...state.sectionTimers,
        [sectionIndex]: {
          ...state.sectionTimers[sectionIndex],
          isRunning,
        },
      },
    })),

  isSubmitted: false,
  submitAssessment: () => set({ isSubmitted: true }),

  findNextAvailableSection: () => {
    const state = get()
    if (!state.assessment) return null

    for (let i = state.currentSection + 1; i < state.assessment.sections.length; i++) {
      if (state.sectionTimers[i]?.timeLeft > 0 && !state.isSectionComplete(i)) {
        return i
      }
    }

    for (let i = 0; i < state.currentSection; i++) {
      if (state.sectionTimers[i]?.timeLeft > 0 && !state.isSectionComplete(i)) {
        return i
      }
    }

    return null
  },

  moveToNextAvailableSection: () => {
    const state = get()
    if (!state.assessment) return

    if (state.assessment.testDuration.sectionWiseDuration) {
      const currentSectionTimer = state.sectionTimers[state.currentSection]

      if (!state.assessment.canSwitchSections && currentSectionTimer?.timeLeft > 0) {
        return
      }

      const updatedTimers = { ...state.sectionTimers }
      if (updatedTimers[state.currentSection]) {
        updatedTimers[state.currentSection].timeLeft = 0
        updatedTimers[state.currentSection].isRunning = false
      }

      let nextSection = state.currentSection + 1
      while (nextSection < state.assessment.sections.length) {
        if (updatedTimers[nextSection]?.timeLeft > 0) {
          updatedTimers[nextSection].isRunning = true

          set({
            currentSection: nextSection,
            sectionTimers: updatedTimers,
          })

          const firstQuestion = state.assessment.sections[nextSection].questions[0]
          if (firstQuestion) {
            state.setCurrentQuestion(firstQuestion)
          }
          return
        }
        nextSection++
      }
    } else {
      const nextSection = state.currentSection + 1
      if (nextSection < state.assessment.sections.length) {
        set({ currentSection: nextSection })
        const firstQuestion = state.assessment.sections[nextSection].questions[0]
        if (firstQuestion) {
          state.setCurrentQuestion(firstQuestion)
        }
        return
      }
    } 

    if (state.entireTestTimer === 0) {
      set({ isSubmitted: true })
    }
  },

  moveToNextQuestion: () => {
    const state = get()
    const { assessment, currentSection, currentQuestion } = state
    if (!assessment || !currentQuestion) return

    const currentSectionQuestions = assessment.sections[currentSection].questions
    const currentIndex = currentSectionQuestions.findIndex((q) => q.questionId === currentQuestion.questionId)

    if (currentIndex < currentSectionQuestions.length - 1) {
      state.setCurrentQuestion(currentSectionQuestions[currentIndex + 1])
    } else {
      state.moveToNextAvailableSection()
    }
  },

  

  isSectionComplete: (sectionIndex: number) => {
    const state = get()
    if (!state.assessment) return false

    const section = state.assessment.sections[sectionIndex]
    if (!section) return false

    return (
      state.sectionTimers[sectionIndex]?.timeLeft === 0 ||
      section.questions.every((question) => state.questionStates[question.questionId]?.isAnswered)
    )
  },

  isSectionAvailable: (sectionIndex: number) => {
    const state = get()
    if (!state.assessment) return false

    if (!state.assessment.testDuration.sectionWiseDuration) {
      return true
    }

    if (state.assessment.canSwitchSections) {
      return state.sectionTimers[sectionIndex]?.timeLeft > 0
    }

    return (
      [...Array(sectionIndex)].every((_, idx) => state.sectionTimers[idx]?.timeLeft === 0) &&
      state.sectionTimers[sectionIndex]?.timeLeft > 0
    )
  },

  tabSwitchCount: 0,
  incrementTabSwitchCount: () => set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 })),

  entireTestTimer: 0,
  setEntireTestTimer: (time) => set({ entireTestTimer: time }),
  updateEntireTestTimer: () =>
    set((state) => {
      const newTimer = Math.max(0, state.entireTestTimer - 1)
      return { entireTestTimer: newTimer }
    }),
    
  saveState: async () => {
    const state = get()
    const dataToSave = {
      assessment: state.assessment,
      currentSection: state.currentSection,
      currentQuestion: state.currentQuestion,
      questionStates: state.questionStates,
      answers: state.answers,
      sectionTimers: state.sectionTimers,
      questionTimers: state.questionTimers,
      entireTestTimer: state.entireTestTimer,
      tabSwitchCount: state.tabSwitchCount,
      questionStartTime: state.questionStartTime,
    }

    await Storage.set({
      key: "ASSESSMENT_STATE",
      value: JSON.stringify(dataToSave),
    })

    localStorage.setItem("ASSESSMENT_STATE", JSON.stringify(dataToSave))
  },

  loadState: async () => {
    let savedState = localStorage.getItem("ASSESSMENT_STATE")

    if (!savedState) {
      const { value } = await Storage.get({ key: "ASSESSMENT_STATE" })
      savedState = value
    }

    if (savedState) {
      const parsedState = JSON.parse(savedState)
      set(parsedState)
    }
  },

  questionStartTime: {},
  setQuestionStartTime: (questionId: string, startTime: number) =>
    set((state) => ({
      questionStartTime: { ...state.questionStartTime, [questionId]: startTime },
    })),

  calculateTimeTaken: (questionId: string) => {
    const state = get()
    const startTime = state.questionStartTime[questionId]
    if (!startTime) return 0
    return Date.now() - startTime
  },
}))

export default useAssessmentStore

