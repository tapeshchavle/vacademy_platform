import { create } from "zustand"
import { Storage } from "@capacitor/storage"
import { Assessment, Question, type QuestionState } from "../types/assessment"

interface JSONAPIResponse {
  Responses: Array<{
    questionId: string
    timeTaken: string
    isMarkForReview: boolean
    questionDurationLeft: string
    correctOptionsIds: {
      questionType: string
      optionIds: string[]
    }
  }>
  otherDetails: {
    entireTestDurationLeft: string
    sectionWiseDurationLeft: {
      [key: string]: string
    }
    tabSwitchCount: number
    announcements: Array<{
      source: "Question_Update" | "time_increase" | "option_update" | "GENERAL_announcement"
      source_id: string
      data: {
        new_rich_html_id: string
        old_text_rich_html_id: string
      }
      timeSend: string
      consumed: boolean
    }>
  }
}

interface Assessment {
  // ... (keep existing fields)
  testDuration: {
    entireTestDuration: string
    sectionWiseDuration: boolean
    questionWiseDuration: boolean
  }
  canSwitchSections: boolean
}

interface Section {
  // ... (keep existing fields)
  sectionDuration: string
}

interface Question {
  // ... (keep existing fields)
  questionDuration?: string
}

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
  saveResponses: () => Promise<void>
  loadResponses: () => Promise<void>
  isSectionComplete: (sectionIndex: number) => boolean
  isSectionAvailable: (sectionIndex: number) => boolean
  tabSwitchCount: number
  announcements: JSONAPIResponse["otherDetails"]["announcements"]
  incrementTabSwitchCount: () => void
  addAnnouncement: (announcement: JSONAPIResponse["otherDetails"]["announcements"][0]) => void
  markAnnouncementConsumed: (index: number) => void
  saveState: () => Promise<void>
  loadState: () => Promise<void>
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
        return state // Return the current state without changes
      }

      const questionStates: Record<string, QuestionState> = {}
      const sectionTimers: Record<number, SectionTimer> = {}
      const questionTimers: Record<string, number> = {}

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

      const [hours, minutes] = assessment.testDuration.entireTestDuration.split(":").map(Number)
      const entireTestTimer = (hours * 3600 + minutes * 60) * 1000

      return {
        assessment,
        questionStates,
        sectionTimers,
        questionTimers,
        entireTestTimer,
        currentSection: 0,
      }
    }),
  setCurrentSection: (sectionIndex) =>
    set((state) => {
      if (!state.assessment) return {}

      // If canSwitchSections is false, only allow moving to next available section
      if (!state.assessment.canSwitchSections) {
        const previousSectionsComplete = [...Array(sectionIndex)].every(
          (_, idx) => state.sectionTimers[idx]?.timeLeft === 0,
        )
        if (!previousSectionsComplete) return {}
      }

      // Update section timers
      const updatedTimers = { ...state.sectionTimers }
      Object.keys(updatedTimers).forEach((key) => {
        const idx = Number(key)
        // If canSwitchSections is false, only current section should be running
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

      // If section time reaches 0, try to move to next available section
      if (timeLeft === 0 && sectionIndex === state.currentSection) {
        const nextSectionIndex = state.findNextAvailableSection()
        if (nextSectionIndex !== null) {
          // Update current section and start its timer
          updatedTimers[nextSectionIndex].isRunning = true
          const firstQuestion = state.assessment?.sections[nextSectionIndex].questions[0]

          return {
            sectionTimers: updatedTimers,
            currentSection: nextSectionIndex,
            currentQuestion: firstQuestion,
          }
        } else {
          // If no sections available and entire test time is up, submit the test
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

    // Start searching from the next section
    for (let i = state.currentSection + 1; i < state.assessment.sections.length; i++) {
      // Check if section has time remaining and is not marked as complete
      if (state.sectionTimers[i]?.timeLeft > 0 && !state.isSectionComplete(i)) {
        return i
      }
    }

    // If no section found after current, search from beginning
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

    // Check if section-wise duration is enabled
    if (state.assessment.testDuration.sectionWiseDuration) {
      const currentSectionTimer = state.sectionTimers[state.currentSection]

      // If current section still has time and canSwitchSections is false, don't move
      if (!state.assessment.canSwitchSections && currentSectionTimer?.timeLeft > 0) {
        return
      }

      // Mark current section as completed
      const updatedTimers = { ...state.sectionTimers }
      if (updatedTimers[state.currentSection]) {
        updatedTimers[state.currentSection].timeLeft = 0
        updatedTimers[state.currentSection].isRunning = false
      }

      // Find next available section
      let nextSection = state.currentSection + 1
      while (nextSection < state.assessment.sections.length) {
        if (updatedTimers[nextSection]?.timeLeft > 0) {
          // Start the timer for next section
          updatedTimers[nextSection].isRunning = true

          set({
            currentSection: nextSection,
            sectionTimers: updatedTimers,
          })

          // Set first question of new section
          const firstQuestion = state.assessment.sections[nextSection].questions[0]
          if (firstQuestion) {
            state.setCurrentQuestion(firstQuestion)
          }
          return
        }
        nextSection++
      }
    } else {
      // If no section-wise duration, just move to next section
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

    // Only submit if entire test timer is up
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
  entireTestTimer: 0,
  setEntireTestTimer: (time) => set({ entireTestTimer: time }),
  updateEntireTestTimer: () =>
    set((state) => {
      const newTimer = Math.max(0, state.entireTestTimer - 1000)
      return { entireTestTimer: newTimer }
    }),
  saveResponses: async () => {
    const state = get()
    const jsonApiResponse: JSONAPIResponse = {
      Responses: Object.entries(state.answers).map(([questionId, optionIds]) => ({
        questionId,
        timeTaken: calculateTimeTaken(questionId, state),
        isMarkForReview: state.questionStates[questionId]?.isMarkedForReview || false,
        questionDurationLeft: String(state.questionTimers[questionId] || 0),
        correctOptionsIds: {
          questionType: optionIds.length > 1 ? "MCQ (Multiple Correct)" : "MCQ (Single Correct)",
          optionIds,
        },
      })),
      otherDetails: {
        entireTestDurationLeft: formatTime(state.entireTestTimer),
        sectionWiseDurationLeft: Object.fromEntries(
          Object.entries(state.sectionTimers).map(([key, timer]) => [key, formatTime(timer.timeLeft)]),
        ),
        tabSwitchCount: state.tabSwitchCount,
        announcements: state.announcements,
      },
    }

    await Storage.set({
      key: "JSON_API_RESPONSE",
      value: JSON.stringify(jsonApiResponse),
    })

    // Also save to localStorage for easy access in Navbar
    localStorage.setItem("JSON_API_RESPONSE", JSON.stringify(jsonApiResponse))
  },
  loadResponses: async () => {
    const { value } = await Storage.get({ key: "JSON_API_RESPONSE" })
    if (value) {
      const jsonApiResponse: JSONAPIResponse = JSON.parse(value)
      set((state) => {
        const answers: Record<string, string[]> = {}
        const questionStates: Record<string, QuestionState> = { ...state.questionStates }
        const questionTimers: Record<string, number> = { ...state.questionTimers }

        jsonApiResponse.Responses.forEach((response) => {
          answers[response.questionId] = response.correctOptionsIds.optionIds
          questionStates[response.questionId] = {
            ...questionStates[response.questionId],
            isAnswered: response.correctOptionsIds.optionIds.length > 0,
            isMarkedForReview: response.isMarkForReview,
            isDisabled: Number.parseInt(response.questionDurationLeft) === 0,
          }
          questionTimers[response.questionId] = Number.parseInt(response.questionDurationLeft)
        })

        const entireTestTimer = parseTime(jsonApiResponse.otherDetails.entireTestDurationLeft)

        const sectionTimers: Record<number, SectionTimer> = {}
        Object.entries(jsonApiResponse.otherDetails.sectionWiseDurationLeft).forEach(([index, duration]) => {
          sectionTimers[Number.parseInt(index)] = {
            timeLeft: parseTime(duration),
            isRunning: Number.parseInt(index) === state.currentSection,
          }
        })

        // Also save to localStorage for easy access in Navbar
        localStorage.setItem("JSON_API_RESPONSE", JSON.stringify(jsonApiResponse))

        return {
          answers,
          questionStates,
          questionTimers,
          entireTestTimer,
          sectionTimers,
        }
      })
    }
  },
  isSectionComplete: (sectionIndex: number) => {
    const state = get()
    if (!state.assessment) return false

    const section = state.assessment.sections[sectionIndex]
    if (!section) return false

    // A section is complete if its timer is at 0 or all questions are answered
    return (
      state.sectionTimers[sectionIndex]?.timeLeft === 0 ||
      section.questions.every((question) => state.questionStates[question.questionId]?.isAnswered)
    )
  },

  // Add new helper method to check if section is available
  isSectionAvailable: (sectionIndex: number) => {
    const state = get()
    if (!state.assessment) return false

    if (!state.assessment.testDuration.sectionWiseDuration) {
      // If no section-wise duration, all sections are available
      return true
    }

    if (state.assessment.canSwitchSections) {
      return state.sectionTimers[sectionIndex]?.timeLeft > 0
    }

    // If canSwitchSections is false, section is only available if all previous sections are complete
    return (
      [...Array(sectionIndex)].every((_, idx) => state.sectionTimers[idx]?.timeLeft === 0) &&
      state.sectionTimers[sectionIndex]?.timeLeft > 0
    )
  },
  tabSwitchCount: 0,
  announcements: [],

  incrementTabSwitchCount: () => set((state) => ({ tabSwitchCount: state.tabSwitchCount + 1 })),

  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [...state.announcements, announcement],
    })),

  markAnnouncementConsumed: (index) =>
    set((state) => ({
      announcements: state.announcements.map((a, i) => (i === index ? { ...a, consumed: true } : a)),
    })),
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
      announcements: state.announcements,
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
}))

// Helper functions
const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

const parseTime = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(":").map(Number)
  return (minutes * 60 + seconds) * 1000
}

const calculateTimeTaken = (questionId: string, state: AssessmentStore) => {
  const question = state.assessment?.sections
    .flatMap((section) => section.questions)
    .find((q) => q.questionId === questionId)

  if (!question || !question.questionDuration) return "00:00"

  const initialDuration = parseTime(question.questionDuration)
  const remainingDuration = state.questionTimers[questionId] || 0
  const timeTaken = initialDuration - remainingDuration

  return formatTime(timeTaken)
}

export default useAssessmentStore

