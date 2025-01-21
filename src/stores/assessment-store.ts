// import { create } from 'zustand'
// import { Assessment, Question, QuestionState } from '../types/assessment'

// interface SectionTimer {
//   timeLeft: number
//   isRunning: boolean
// }

// interface AssessmentStore {
//   assessment: Assessment | null
//   currentSection: number
//   currentQuestion: Question | null
//   questionStates: Record<string, QuestionState>
//   answers: Record<string, string>
//   sectionTimers: Record<number, SectionTimer>
//   setAssessment: (assessment: Assessment) => void
//   setCurrentSection: (sectionIndex: number) => void
//   setCurrentQuestion: (question: Question) => void
//   setQuestionState: (questionId: string, state: Partial<QuestionState>) => void
//   setAnswer: (questionId: string, answerId: string | null) => void
//   markForReview: (questionId: string) => void
//   clearResponse: (questionId: string) => void
//   updateSectionTimer: (sectionIndex: number, timeLeft: number) => void
//   toggleSectionTimer: (sectionIndex: number, isRunning: boolean) => void
//   isSubmitted: boolean
//   submitAssessment: () => void
//   findNextAvailableSection: () => number | null
//   moveToNextAvailableSection: () => void
// }

// export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
//   assessment: null,
//   currentSection: 0,
//   currentQuestion: null,
//   questionStates: {},
//   answers: {},
//   sectionTimers: {},
//   setAssessment: (assessment) => set((state) => {
//     const questionStates: Record<string, QuestionState> = {}
//     const sectionTimers: Record<number, SectionTimer> = {}
    
//     assessment.sections.forEach((section, index) => {
//       const [minutes, seconds] = section.assesmentDuration.split(':').map(Number)
//       sectionTimers[index] = {
//         timeLeft: (minutes * 60 + seconds) * 1000,
//         isRunning: index === 0
//       }
      
//       // Check if questions is an array, if not, convert it to an array
//       const questions = Array.isArray(section.questions) ? section.questions : [section.questions]
//       questions.forEach(question => {
//         questionStates[question.questionId] = {
//           isAnswered: false,
//           isVisited: false,
//           isMarkedForReview: false
//         }
//       })
//     })
    
//     return { assessment, questionStates, sectionTimers }
//   }),
//   setCurrentSection: (sectionIndex) => set((state) => {
//     // Pause current section timer and start new section timer
//     const updatedTimers = { ...state.sectionTimers }
//     Object.keys(updatedTimers).forEach(key => {
//       updatedTimers[Number(key)].isRunning = Number(key) === sectionIndex
//     })
//     return { currentSection: sectionIndex, sectionTimers: updatedTimers }
//   }),
//   setCurrentQuestion: (question) => set((state) => ({
//     currentQuestion: question,
//     questionStates: {
//       ...state.questionStates,
//       [question.questionId]: {
//         ...state.questionStates[question.questionId],
//         isVisited: true
//       }
//     }
//   })),
//   setQuestionState: (questionId, state) => set((prevState) => ({
//     questionStates: {
//       ...prevState.questionStates,
//       [questionId]: { ...prevState.questionStates[questionId], ...state }
//     }
//   })),
//   setAnswer: (questionId, answerId) => set((state) => ({
//     answers: answerId ? { ...state.answers, [questionId]: answerId } : 
//       Object.fromEntries(Object.entries(state.answers).filter(([key]) => key !== questionId)),
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: { 
//         ...state.questionStates[questionId], 
//         isAnswered: Boolean(answerId)
//       }
//     }
//   })),
//   markForReview: (questionId) => set((state) => ({
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isMarkedForReview: !state.questionStates[questionId].isMarkedForReview
//       }
//     }
//   })),
//   clearResponse: (questionId) => set((state) => ({
//     answers: Object.fromEntries(Object.entries(state.answers).filter(([key]) => key !== questionId)),
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isAnswered: false
//       }
//     }
//   })),
//   updateSectionTimer: (sectionIndex, timeLeft) => set((state) => ({
//     sectionTimers: {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         timeLeft
//       }
//     }
//   })),
//   toggleSectionTimer: (sectionIndex, isRunning) => set((state) => ({
//     sectionTimers: {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         isRunning
//       }
//     }
//   })),
//   isSubmitted: false,
//   submitAssessment: () => set({ isSubmitted: true }),
//   findNextAvailableSection: () => {
//     const state = get()
//     const { sectionTimers } = state
    
//     // Find the next section that still has time remaining
//     for (let i = 0; i < Object.keys(sectionTimers).length; i++) {
//       if (sectionTimers[i]?.timeLeft > 0) {
//         return i
//       }
//     }
//     return null // No available sections
//   },

//   moveToNextAvailableSection: () => {
//     const state = get()
//     const nextSection = state.findNextAvailableSection()
    
//     if (nextSection !== null) {
//       const firstQuestion = state.assessment?.sections[nextSection].questions[0]
//       if (firstQuestion) {
//         state.setCurrentSection(nextSection)
//         state.setCurrentQuestion(firstQuestion)
//       }
//     }
//   }
// }))









































// import { create } from 'zustand'
// import { Assessment, Question, QuestionState, TestResponse, TestDuration } from '../types/assessment'
// // import { saveData, getData } from '../utils/network'
// import { toast } from '@/components/ui/use-toast'
// import { App } from '@capacitor/app'
// import { saveResponse, saveTestDuration, getTestDuration } from '@/routes/assessment/examination/-utils.ts/capacitor'
// import { saveData, getData } from '@/routes/assessment/examination/-utils.ts/network'
// import { saveResponse, saveTestDuration, getTestDuration } from '@/routes/assessment/examination/-utils.ts/capacitor'

// interface SectionTimer {
//   timeLeft: number
//   isRunning: boolean
// }

// interface AssessmentStore {
//   assessment: Assessment | null
//   currentSection: number
//   currentQuestion: Question | null
//   questionStates: Record<string, QuestionState>
//   answers: Record<string, string>
//   sectionTimers: Record<number, SectionTimer>
//   questionTimers: Record<string, number>
//   responses: Record<string, TestResponse>
//   testEndTime: number | null
//   testDuration: {
//     entireTestDurationLeft: string,
//     sectionWiseDurationLeft: string,
//     questionWiseDurationLeft: string
//   } | null
//   setAssessment: (assessment: Assessment) => void
//   setCurrentSection: (sectionIndex: number) => void
//   setCurrentQuestion: (question: Question) => void
//   setQuestionState: (questionId: string, state: Partial<QuestionState>) => void
//   setAnswer: (questionId: string, answerId: string | null) => void
//   markForReview: (questionId: string) => void
//   clearResponse: (questionId: string) => void
//   updateSectionTimer: (sectionIndex: number, timeLeft: number) => void
//   toggleSectionTimer: (sectionIndex: number, isRunning: boolean) => void
//   setQuestionTimer: (questionId: string, timeLeft: number) => void
//   updateTimeTaken: (questionId: string) => void
//   setTestEndTime: (endTime: number) => void
//   isSubmitted: boolean
//   submitAssessment: () => void
//   findNextAvailableSection: () => number | null
//   moveToNextAvailableSection: () => void
//   loadStoredData: () => Promise<void>
//   updateTestDuration: (duration: {
//     entireTestDurationLeft: string,
//     sectionWiseDurationLeft: string,
//     questionWiseDurationLeft: string
//   }) => void
//   loadTestDuration: () => Promise<void>
// }

// export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
//   assessment: null,
//   currentSection: 0,
//   currentQuestion: null,
//   questionStates: {},
//   answers: {},
//   sectionTimers: {},
//   questionTimers: {},
//   responses: {},
//   testEndTime: null,
//   testDuration: null,
//   setAssessment: (assessment) => set((state) => {
//     const questionStates: Record<string, QuestionState> = {}
//     const sectionTimers: Record<number, SectionTimer> = {}
//     const questionTimers: Record<string, number> = {}
    
//     assessment.sections.forEach((section, index) => {
//       if (assessment.testDuration.sectionWiseDuration.checked) {
//         const [minutes, seconds] = section.sectionDuration.split(':').map(Number)
//         sectionTimers[index] = {
//           timeLeft: (minutes * 60 + seconds) * 1000,
//           isRunning: index === 0
//         }
//       }
      
//       section.questions.forEach(question => {
//         questionStates[question.questionId] = {
//           isAnswered: false,
//           isVisited: false,
//           isMarkedForReview: false,
//           timeTaken: 0
//         }
//         if (assessment.testDuration.questionWiseDuration.checked) {
//           // Convert question duration from format "MM:SS" to seconds
//           const [minutes, seconds] = question.questionDuration.split(':').map(Number)
//           questionTimers[question.questionId] = minutes * 60 + seconds
//         }
//       })
//     })
    
//     let testEndTime = null
//     if (assessment.testDuration.entireTestDuration) {
//       const [hours, minutes] = assessment.testDuration.entireTestDuration.split(':').map(Number)
//       const durationInMs = (hours * 3600 + minutes * 60) * 1000
//       testEndTime = Date.now() + durationInMs
//     }
    
//     saveData('assessment', assessment)
//     saveData('questionStates', questionStates)
//     saveData('sectionTimers', sectionTimers)
//     saveData('questionTimers', questionTimers)
//     saveData('testEndTime', testEndTime)
    
//     return { assessment, questionStates, sectionTimers, questionTimers, testEndTime }

//   }),
//   setCurrentSection: (sectionIndex) => set((state) => {
//     const updatedTimers = { ...state.sectionTimers }
//     if (state.assessment?.testDuration.sectionWiseDuration.checked) {
//       Object.keys(updatedTimers).forEach(key => {
//         updatedTimers[Number(key)].isRunning = Number(key) === sectionIndex
//       })
//     }
//     saveData('sectionTimers', updatedTimers)
//     saveData('currentSection', sectionIndex)
//     return { currentSection: sectionIndex, sectionTimers: updatedTimers }
//   }),
//   setCurrentQuestion: (question) => set((state) => {
//     const updatedStates = {
//       ...state.questionStates,
//       [question.questionId]: {
//         ...state.questionStates[question.questionId],
//         isVisited: true
//       }
//     }
//     saveData('questionStates', updatedStates)
//     saveData('currentQuestion', question)
//     return { currentQuestion: question, questionStates: updatedStates }
//   }),
//   setQuestionState: (questionId, state) => set((prevState) => {
//     const updatedStates = {
//       ...prevState.questionStates,
//       [questionId]: { ...prevState.questionStates[questionId], ...state }
//     }
//     saveData('questionStates', updatedStates)
//     return { questionStates: updatedStates }
//   }),
//   setAnswer: (questionId, answerId) => set((state) => {
//     const question = state.assessment?.sections
//       .flatMap(section => section.questions)
//       .find(q => q.questionId === questionId)

//     if (!question) return state

//     const updatedResponses = {
//       ...state.responses,
//       [questionId]: { 
//         ...state.responses[questionId],
//         questionId,
//         answerId: answerId ? [answerId] : [],
//         timeTaken: state.responses[questionId]?.timeTaken || 0
//       }
//     }
//     const updatedStates = {
//       ...state.questionStates,
//       [questionId]: { 
//         ...state.questionStates[questionId], 
//         isAnswered: Boolean(answerId)
//       }
//     }
    
//     saveResponse(questionId, answerId ? [answerId] : [], question.questionType)
    
//     return { responses: updatedResponses, questionStates: updatedStates }
//   }),
//   markForReview: (questionId) => set((state) => {
//     const updatedStates = {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isMarkedForReview: !state.questionStates[questionId].isMarkedForReview
//       }
//     }
//     saveData('questionStates', updatedStates)
//     return { questionStates: updatedStates }
//   }),
//   clearResponse: (questionId) => set((state) => {
//     const { [questionId]: _, ...updatedResponses } = state.responses
//     const updatedStates = {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isAnswered: false
//       }
//     }
//     saveData('responses', updatedResponses)
//     saveData('questionStates', updatedStates)
//     return { responses: updatedResponses, questionStates: updatedStates }
//   }),
//   updateSectionTimer: (sectionIndex, timeLeft) => set((state) => {
//     if (!state.assessment?.testDuration.sectionWiseDuration.checked) return state
//     const updatedTimers = {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         timeLeft
//       }
//     }
//     saveData('sectionTimers', updatedTimers)
//     return { sectionTimers: updatedTimers }
//   }),
//   toggleSectionTimer: (sectionIndex, isRunning) => set((state) => {
//     if (!state.assessment?.testDuration.sectionWiseDuration.checked) return state
//     const updatedTimers = {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         isRunning
//       }
//     }
//     saveData('sectionTimers', updatedTimers)
//     return { sectionTimers: updatedTimers }
//   }),
//   setQuestionTimer: (questionId, timeLeft) => set((state) => {
//     if (!state.assessment?.testDuration.questionWiseDuration.checked) return state
//     const updatedTimers = { ...state.questionTimers, [questionId]: timeLeft }
//     saveData('questionTimers', updatedTimers)
//     return { questionTimers: updatedTimers }
//   }),
//   updateTimeTaken: (questionId) => set((state) => {
//     if (!state.assessment?.testDuration.questionWiseDuration.checked) return state
//     const timeTaken = state.responses[questionId]?.timeTaken || 0
//     const newTimeTaken = timeTaken + 1
//     const updatedResponses = {
//       ...state.responses,
//       [questionId]: { ...state.responses[questionId], timeTaken: newTimeTaken }
//     }
//     saveData('responses', updatedResponses)
//     return { responses: updatedResponses }
//   }),
//   setTestEndTime: (endTime) => set({ testEndTime: endTime }),
//   isSubmitted: false,
//   submitAssessment: () => {
//     set({ isSubmitted: true })
//     saveData('responses', null)
//     saveData('questionStates', null)
//     saveData('sectionTimers', null)
//     saveData('questionTimers', null)
//     saveData('testEndTime', null)
//   },
//   findNextAvailableSection: () => {
//     const state = get()
//     const { sectionTimers } = state
    
//     for (let i = 0; i < Object.keys(sectionTimers).length; i++) {
//       if (sectionTimers[i]?.timeLeft > 0) {
//         return i
//       }
//     }
//     return null
//   },
//   moveToNextAvailableSection: () => {
//     const state = get()
//     const nextSection = state.findNextAvailableSection()
    
//     if (nextSection !== null) {
//       const firstQuestion = state.assessment?.sections[nextSection].questions[0]
//       if (firstQuestion) {
//         state.setCurrentSection(nextSection)
//         state.setCurrentQuestion(firstQuestion)
//       }
//     }
//   },
//   loadStoredData: async () => {
//     const assessment = await getData('assessment')
//     const questionStates = await getData('questionStates')
//     const responses = await getData('responses')
//     const sectionTimers = await getData('sectionTimers')
//     const questionTimers = await getData('questionTimers')
//     const currentSection = await getData('currentSection')
//     const currentQuestion = await getData('currentQuestion')
//     const testEndTime = await getData('testEndTime')

//     set({
//       assessment: assessment || null,
//       questionStates: questionStates || {},
//       responses: responses || {},
//       sectionTimers: sectionTimers || {},
//       questionTimers: questionTimers || {},
//       currentSection: currentSection || 0,
//       currentQuestion: currentQuestion || null,
//       testEndTime: testEndTime || null
//     })
//   },
//   updateTestDuration: (duration) => {
//     saveTestDuration(duration)
//     set({ testDuration: duration })
//   },
//   loadTestDuration: async () => {
//     const duration = await getTestDuration()
//     if (duration) {
//       set({ testDuration: duration })
//     }
//   }
// }))

// // Initialize back button handler for mobile
// if (typeof window !== 'undefined') {
//   App.addListener('backButton', () => {
//     if (!useAssessmentStore.getState().isSubmitted) {
//       const confirmSubmit = window.confirm('Are you sure you want to submit the test?')
//       if (confirmSubmit) {
//         useAssessmentStore.getState().submitAssessment()
//       }
//     }
//   })
// }





// import { create } from 'zustand'
// import { Plugins } from '@capacitor/core'
// import { Assessment, Question, QuestionState } from '../types/assessment'

// const { Storage } = Plugins

// interface MarkedResponse {
//   questionId: string
//   timeTakenForQuestion: string
//   questionDurationLeft: string
//   correctOptionsIds: {
//     questionType: "multiple select MCQ" | "single select MCQ"
//     optionIds: string[]
//   }
// }

// interface JSONAPIResponse {
//   response: MarkedResponse[]
//   testDuration: {
//     entireTestDurationLeft: string
//     sectionWiseDurationLeft: string[]
//   }
// }

// interface Assessment {
//   // ... (keep existing fields)
//   testDuration: {
//     entireTestDuration: string;
//     sectionWiseDuration: boolean;
//     questionWiseDuration: boolean;
//   };
//   canSwitchSections: boolean;
// }

// interface Section {
//   // ... (keep existing fields)
//   sectionDuration: string;
// }

// interface Question {
//   // ... (keep existing fields)
//   questionDuration?: string;
// }

// interface SectionTimer {
//   timeLeft: number
//   isRunning: boolean
// }

// interface AssessmentStore {
//   assessment: Assessment | null
//   currentSection: number
//   currentQuestion: Question | null
//   questionStates: Record<string, QuestionState>
//   answers: Record<string, string[]>
//   sectionTimers: Record<number, SectionTimer>
//   questionTimers: Record<string, number>
//   setAssessment: (assessment: Assessment) => void
//   setCurrentSection: (sectionIndex: number) => void
//   setCurrentQuestion: (question: Question) => void
//   setQuestionState: (questionId: string, state: Partial<QuestionState>) => void
//   setAnswer: (questionId: string, answerId: string[]) => void
//   markForReview: (questionId: string) => void
//   clearResponse: (questionId: string) => void
//   updateSectionTimer: (sectionIndex: number, timeLeft: number) => void
//   updateQuestionTimer: (questionId: string, timeLeft: number) => void
//   toggleSectionTimer: (sectionIndex: number, isRunning: boolean) => void
//   isSubmitted: boolean
//   submitAssessment: () => void
//   findNextAvailableSection: () => number | null
//   moveToNextAvailableSection: () => void
//   moveToNextQuestion: () => void
//   entireTestTimer: number;
//   setEntireTestTimer: (time: number) => void;
//   updateEntireTestTimer: () => void;
//   saveResponses: () => Promise<void>
//   loadResponses: () => Promise<void>
// }

// export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
//   assessment: null,
//   currentSection: 0,
//   currentQuestion: null,
//   questionStates: {},
//   answers: {},
//   sectionTimers: {},
//   questionTimers: {},
//   setAssessment: (assessment) => set((state) => {
//     const questionStates: Record<string, QuestionState> = {};
//     const sectionTimers: Record<number, SectionTimer> = {};
//     const questionTimers: Record<string, number> = {};
    
//     assessment.sections.forEach((section, index) => {
//       if (assessment.testDuration.sectionWiseDuration) {
//         const [minutes, seconds] = section.sectionDuration.split(':').map(Number);
//         sectionTimers[index] = {
//           timeLeft: (minutes * 60 + seconds) * 1000,
//           isRunning: index === 0
//         };
//       }
      
//       section.questions.forEach(question => {
//         questionStates[question.questionId] = {
//           isAnswered: false,
//           isVisited: false,
//           isMarkedForReview: false,
//           isDisabled: false
//         };
//         if (assessment.testDuration.questionWiseDuration && question.questionDuration) {
//           const [minutes, seconds] = question.questionDuration.split(':').map(Number);
//           questionTimers[question.questionId] = (minutes * 60 + seconds) * 1000;
//         }
//       });
//     });
    
//     const [hours, minutes] = assessment.testDuration.entireTestDuration.split(':').map(Number);
//     const entireTestTimer = (hours * 3600 + minutes * 60) * 1000;
    
//     return { assessment, questionStates, sectionTimers, questionTimers, entireTestTimer };
//   }),
//   setCurrentSection: (sectionIndex) => set((state) => {
//     if (!state.assessment?.canSwitchSections) {
//       return {};
//     }
    
//     // Pause current section timer and start new section timer
//     const updatedTimers = { ...state.sectionTimers }
//     Object.keys(updatedTimers).forEach(key => {
//       updatedTimers[Number(key)].isRunning = Number(key) === sectionIndex
//     })
//     return { currentSection: sectionIndex, sectionTimers: updatedTimers }
//   }),
//   setCurrentQuestion: (question) => set((state) => ({
//     currentQuestion: question,
//     questionStates: {
//       ...state.questionStates,
//       [question.questionId]: {
//         ...state.questionStates[question.questionId],
//         isVisited: true
//       }
//     }
//   })),
//   setQuestionState: (questionId, state) => set((prevState) => ({
//     questionStates: {
//       ...prevState.questionStates,
//       [questionId]: { ...prevState.questionStates[questionId], ...state }
//     }
//   })),
//   setAnswer: (questionId, answerIds) => set((state) => ({
//     answers: { ...state.answers, [questionId]: answerIds },
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: { 
//         ...state.questionStates[questionId], 
//         isAnswered: answerIds.length > 0
//       }
//     }
//   })),
//   markForReview: (questionId) => set((state) => ({
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isMarkedForReview: !state.questionStates[questionId].isMarkedForReview
//       }
//     }
//   })),
//   clearResponse: (questionId) => set((state) => ({
//     answers: { ...state.answers, [questionId]: [] },
//     questionStates: {
//       ...state.questionStates,
//       [questionId]: {
//         ...state.questionStates[questionId],
//         isAnswered: false
//       }
//     }
//   })),
//   updateSectionTimer: (sectionIndex, timeLeft) => set((state) => ({
//     sectionTimers: {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         timeLeft
//       }
//     }
//   })),
//   updateQuestionTimer: (questionId, timeLeft) => set((state) => ({
//     questionTimers: {
//       ...state.questionTimers,
//       [questionId]: timeLeft
//     }
//   })),
//   toggleSectionTimer: (sectionIndex, isRunning) => set((state) => ({
//     sectionTimers: {
//       ...state.sectionTimers,
//       [sectionIndex]: {
//         ...state.sectionTimers[sectionIndex],
//         isRunning
//       }
//     }
//   })),
//   isSubmitted: false,
//   submitAssessment: () => set({ isSubmitted: true }),
//   findNextAvailableSection: () => {
//     const state = get()
//     const { sectionTimers } = state
    
//     for (let i = 0; i < Object.keys(sectionTimers).length; i++) {
//       if (sectionTimers[i]?.timeLeft > 0) {
//         return i
//       }
//     }
//     return null
//   },
//   moveToNextAvailableSection: () => {
//     const state = get()
//     const nextSection = state.findNextAvailableSection()
    
//     if (nextSection !== null) {
//       const firstQuestion = state.assessment?.sections[nextSection].questions[0]
//       if (firstQuestion) {
//         state.setCurrentSection(nextSection)
//         state.setCurrentQuestion(firstQuestion)
//       }
//     }
//   },
//   moveToNextQuestion: () => {
//     const state = get()
//     const { assessment, currentSection, currentQuestion } = state
//     if (!assessment || !currentQuestion) return

//     const currentSectionQuestions = assessment.sections[currentSection].questions
//     const currentIndex = currentSectionQuestions.findIndex(q => q.questionId === currentQuestion.questionId)
    
//     if (currentIndex < currentSectionQuestions.length - 1) {
//       state.setCurrentQuestion(currentSectionQuestions[currentIndex + 1])
//     } else {
//       state.moveToNextAvailableSection()
//     }
//   },
//   entireTestTimer: 0,
//   setEntireTestTimer: (time) => set({ entireTestTimer: time }),
//   updateEntireTestTimer: () => set((state) => ({
//     entireTestTimer: Math.max(0, state.entireTestTimer - 1000)
//   })),
//   saveResponses: async () => {
//     const state = get()
//     const jsonApiResponse: JSONAPIResponse = {
//       response: Object.entries(state.answers).map(([questionId, optionIds]) => ({
//         MarkedResponse: {
//           questionId,
//           timeTakenForQuestion: "", // Calculate this based on the initial question duration and the time left
//           questionDurationLeft: String(state.questionTimers[questionId] || 0),
//           correctOptionsIds: {
//             questionType: optionIds.length > 1 ? "multiple select MCQ" : "single select MCQ",
//             optionIds
//           }
//         }
//       })),
//       testDuration: {
//         entireTestDurationLeft: `${Math.floor(state.entireTestTimer / 60000)}:${String(Math.floor((state.entireTestTimer % 60000) / 1000)).padStart(2, '0')}`,
//         sectionWiseDurationLeft: Object.values(state.sectionTimers).map(timer => 
//           `${Math.floor(timer.timeLeft / 60000)}:${String(Math.floor((timer.timeLeft % 60000) / 1000)).padStart(2, '0')}`
//         )
//       }
//     }

//     await Storage.set({
//       key: 'JSON_API_RESPONSE',
//       value: JSON.stringify(jsonApiResponse)
//     })
//   },
//   loadResponses: async () => {
//     const { value } = await Storage.get({ key: 'JSON_API_RESPONSE' })
//     if (value) {
//       const jsonApiResponse: JSONAPIResponse = JSON.parse(value)
//       set((state) => {
//         const answers: Record<string, string[]> = {}
//         const questionStates: Record<string, QuestionState> = { ...state.questionStates }
//         const questionTimers: Record<string, number> = { ...state.questionTimers }

//         jsonApiResponse.response.forEach(({ MarkedResponse }) => {
//           answers[MarkedResponse.questionId] = MarkedResponse.correctOptionsIds.optionIds
//           questionStates[MarkedResponse.questionId] = {
//             ...questionStates[MarkedResponse.questionId],
//             isAnswered: MarkedResponse.correctOptionsIds.optionIds.length > 0,
//             isDisabled: parseInt(MarkedResponse.questionDurationLeft) === 0
//           }
//           questionTimers[MarkedResponse.questionId] = parseInt(MarkedResponse.questionDurationLeft)
//         })

//         const [hours, minutes] = jsonApiResponse.testDuration.entireTestDurationLeft.split(':').map(Number)
//         const entireTestTimer = (hours * 60 + minutes) * 60 * 1000

//         const sectionTimers: Record<number, SectionTimer> = {}
//         jsonApiResponse.testDuration.sectionWiseDurationLeft.forEach((duration, index) => {
//           const [minutes, seconds] = duration.split(':').map(Number)
//           sectionTimers[index] = {
//             timeLeft: (minutes * 60 + seconds) * 1000,
//             isRunning: index === state.currentSection
//           }
//         })

//         return { answers, questionStates, questionTimers, entireTestTimer, sectionTimers }
//       })
//     }
//   }
// }))













































import { create } from 'zustand'
import { Plugins } from '@capacitor/core'
import { Assessment, Question, QuestionState } from '../types/assessment'

const { Storage } = Plugins

interface MarkedResponse {
  questionId: string
  timeTakenForQuestion: string
  questionDurationLeft: string
  correctOptionsIds: {
    questionType: "MCQ (Multiple Correct)" | "MCQ (Single Correct)"
    optionIds: string[]
  }
}

interface JSONAPIResponse {
  response: MarkedResponse[]
  testDuration: {
    entireTestDurationLeft: string
    sectionWiseDurationLeft: string[]
  }
}

interface Assessment {
  // ... (keep existing fields)
  testDuration: {
    entireTestDuration: string;
    sectionWiseDuration: boolean;
    questionWiseDuration: boolean;
  };
  canSwitchSections: boolean;
}

interface Section {
  // ... (keep existing fields)
  sectionDuration: string;
}

interface Question {
  // ... (keep existing fields)
  questionDuration?: string;
}

interface SectionTimer {
  timeLeft: number
  isRunning: boolean
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
  entireTestTimer: number;
  setEntireTestTimer: (time: number) => void;
  updateEntireTestTimer: () => void;
  saveResponses: () => Promise<void>
  loadResponses: () => Promise<void>
  isSectionComplete: (sectionIndex: number) => boolean;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  assessment: null,
  currentSection: 0,
  currentQuestion: null,
  questionStates: {},
  answers: {},
  sectionTimers: {},
  questionTimers: {},
  // setAssessment: (assessment) => set((state) => {
  //   const questionStates: Record<string, QuestionState> = {};
  //   const sectionTimers: Record<number, SectionTimer> = {};
  //   const questionTimers: Record<string, number> = {};
    
  //   assessment.sections.forEach((section, index) => {
  //     if (assessment.testDuration.sectionWiseDuration) {
  //       const [minutes, seconds] = section.sectionDuration.split(':').map(Number);
  //       sectionTimers[index] = {
  //         timeLeft: (minutes * 60 + seconds) * 1000,
  //         isRunning: !assessment.canSwitchSections ? index === 0 : false
  //       };
  //     } else {
  //       // If no section-wise duration, set a large default value
  //       sectionTimers[index] = {
  //         timeLeft: Number.MAX_SAFE_INTEGER,
  //         isRunning: !assessment.canSwitchSections ? index === 0 : false
  //       };
  //     }
      
  //     section.questions.forEach(question => {
  //       questionStates[question.questionId] = {
  //         isAnswered: false,
  //         isVisited: false,
  //         isMarkedForReview: false,
  //         isDisabled: false
  //       };
        
  //       if (assessment.testDuration.questionWiseDuration && question.questionDuration) {
  //         const [minutes, seconds] = question.questionDuration.split(':').map(Number);
  //         questionTimers[question.questionId] = (minutes * 60 + seconds) * 1000;
  //       }
  //     });
  //   });
    
  //   // const [hours, minutes] = assessment.testDuration.entireTestDuration.split(':').map(Number);
  //   // const entireTestTimer = (hours * 3600 + minutes * 60) * 1000;
  //   const [hours, minutes] = assessment.testDuration.entireTestDuration.split(':').map(Number);
  //   const entireTestTimer = (hours * 3600 + minutes * 60) * 1000;
    
  //   return { 
  //     assessment, 
  //     questionStates, 
  //     sectionTimers, 
  //     questionTimers, 
  //     entireTestTimer,
  //     currentSection: 0
  //   };
  // }),
  setAssessment: (assessment) => set((state) => {
    const questionStates: Record<string, QuestionState> = {};
    const sectionTimers: Record<number, SectionTimer> = {};
    const questionTimers: Record<string, number> = {};
    
    assessment.sections.forEach((section, index) => {
      if (assessment.testDuration.sectionWiseDuration) {
        const [minutes, seconds] = section.sectionDuration.split(':').map(Number);
        sectionTimers[index] = {
          timeLeft: (minutes * 60 + seconds) * 1000,
          // Only start first section if canSwitchSections is false
          isRunning: !assessment.canSwitchSections ? index === 0 : false,
          // Track if section has been activated
          hasStarted: index === 0
        };
      }
      
      section.questions.forEach(question => {
        questionStates[question.questionId] = {
          isAnswered: false,
          isVisited: false,
          isMarkedForReview: false,
          isDisabled: false
        };
        
        if (assessment.testDuration.questionWiseDuration && question.questionDuration) {
          const [minutes, seconds] = question.questionDuration.split(':').map(Number);
          questionTimers[question.questionId] = (minutes * 60 + seconds) * 1000;
        }
      });
    });
    
    const [hours, minutes] = assessment.testDuration.entireTestDuration.split(':').map(Number);
    const entireTestTimer = (hours * 3600 + minutes * 60) * 1000;
    
    return { 
      assessment, 
      questionStates, 
      sectionTimers, 
      questionTimers, 
      entireTestTimer,
      currentSection: 0
    };
  }),
  setCurrentSection: (sectionIndex) => set((state) => {
    if (!state.assessment) return {};

    // If canSwitchSections is false, only allow moving to next available section
    if (!state.assessment.canSwitchSections) {
      const previousSectionsComplete = [...Array(sectionIndex)].every((_, idx) => 
        state.sectionTimers[idx]?.timeLeft === 0
      );
      if (!previousSectionsComplete) return {};
    }
    
    // Update section timers
    const updatedTimers = { ...state.sectionTimers };
    Object.keys(updatedTimers).forEach(key => {
      const idx = Number(key);
      // If canSwitchSections is false, only current section should be running
      if (!state.assessment?.canSwitchSections) {
        updatedTimers[idx].isRunning = idx === sectionIndex;
      }
    });

    return { 
      currentSection: sectionIndex, 
      sectionTimers: updatedTimers 
    };
  }),
  
  setCurrentQuestion: (question) => set((state) => ({
    currentQuestion: question,
    questionStates: {
      ...state.questionStates,
      [question.questionId]: {
        ...state.questionStates[question.questionId],
        isVisited: true
      }
    }
  })),
  setQuestionState: (questionId, state) => set((prevState) => ({
    questionStates: {
      ...prevState.questionStates,
      [questionId]: { ...prevState.questionStates[questionId], ...state }
    }
  })),
  setAnswer: (questionId, answerIds) => set((state) => ({
    answers: { ...state.answers, [questionId]: answerIds },
    questionStates: {
      ...state.questionStates,
      [questionId]: { 
        ...state.questionStates[questionId], 
        isAnswered: answerIds.length > 0
      }
    }
  })),
  markForReview: (questionId) => set((state) => ({
    questionStates: {
      ...state.questionStates,
      [questionId]: {
        ...state.questionStates[questionId],
        isMarkedForReview: !state.questionStates[questionId].isMarkedForReview
      }
    }
  })),
  clearResponse: (questionId) => set((state) => ({
    answers: { ...state.answers, [questionId]: [] },
    questionStates: {
      ...state.questionStates,
      [questionId]: {
        ...state.questionStates[questionId],
        isAnswered: false
      }
    }
  })),
  updateSectionTimer: (sectionIndex, timeLeft) => set((state) => {
    if (!state.assessment?.testDuration.sectionWiseDuration) {
      return {};
    }

    const updatedTimers = {
      ...state.sectionTimers,
      [sectionIndex]: {
        ...state.sectionTimers[sectionIndex],
        timeLeft
      }
    };

    // If section time reaches 0, try to move to next available section
    if (timeLeft === 0 && sectionIndex === state.currentSection) {
      const nextSectionIndex = state.findNextAvailableSection();
      if (nextSectionIndex !== null) {
        // Update current section and start its timer
        updatedTimers[nextSectionIndex].isRunning = true;
        const firstQuestion = state.assessment?.sections[nextSectionIndex].questions[0];
        
        return {
          sectionTimers: updatedTimers,
          currentSection: nextSectionIndex,
          currentQuestion: firstQuestion
        };
      } else {
        // If no sections available and entire test time is up, submit the test
        if (state.entireTestTimer <= 0) {
          return {
            sectionTimers: updatedTimers,
            isSubmitted: true
          };
        }
      }
    }

    return { sectionTimers: updatedTimers };
  }),
  
  updateQuestionTimer: (questionId, timeLeft) => set((state) => ({
    questionTimers: {
      ...state.questionTimers,
      [questionId]: timeLeft
    }
  })),
  toggleSectionTimer: (sectionIndex, isRunning) => set((state) => ({
    sectionTimers: {
      ...state.sectionTimers,
      [sectionIndex]: {
        ...state.sectionTimers[sectionIndex],
        isRunning
      }
    }
  })),
  isSubmitted: false,
  submitAssessment: () => set({ isSubmitted: true }),
  findNextAvailableSection: () => {
    const state = get();
    if (!state.assessment) return null;

    // Start searching from the next section
    for (let i = state.currentSection + 1; i < state.assessment.sections.length; i++) {
      // Check if section has time remaining and is not marked as complete
      if (state.sectionTimers[i]?.timeLeft > 0 && !state.isSectionComplete(i)) {
        return i;
      }
    }

    // If no section found after current, search from beginning
    for (let i = 0; i < state.currentSection; i++) {
      if (state.sectionTimers[i]?.timeLeft > 0 && !state.isSectionComplete(i)) {
        return i;
      }
    }

    return null;
  },
  //  moveToNextAvailableSection: () => {
  //   const state = get();
  //   if (!state.assessment) return;

  //   // Check if section-wise duration is enabled
  //   if (state.assessment.testDuration.sectionWiseDuration) {
  //     const currentSectionTimer = state.sectionTimers[state.currentSection];
      
  //     // If current section still has time and canSwitchSections is false, don't move
  //     if (!state.assessment.canSwitchSections && currentSectionTimer?.timeLeft > 0) {
  //       return;
  //     }

  //     // Mark current section as completed
  //     const updatedTimers = { ...state.sectionTimers };
  //     if (updatedTimers[state.currentSection]) {
  //       updatedTimers[state.currentSection].timeLeft = 0;
  //       updatedTimers[state.currentSection].isRunning = false;
  //     }

  //     // Find next available section
  //     let nextSection = state.currentSection + 1;
  //     while (nextSection < state.assessment.sections.length) {
  //       if (updatedTimers[nextSection]?.timeLeft > 0) {
  //         // Start the timer for next section
  //         updatedTimers[nextSection].isRunning = true;
          
  //         set({ 
  //           currentSection: nextSection,
  //           sectionTimers: updatedTimers
  //         });

  //         // Set first question of new section
  //         const firstQuestion = state.assessment.sections[nextSection].questions[0];
  //         if (firstQuestion) {
  //           state.setCurrentQuestion(firstQuestion);
  //         }
  //         return;
  //       }
  //       nextSection++;
  //     }
  //   } else {
  //     // If no section-wise duration, just move to next section
  //     const nextSection = state.currentSection + 1;
  //     if (nextSection < state.assessment.sections.length) {
  //       set({ currentSection: nextSection });
  //       const firstQuestion = state.assessment.sections[nextSection].questions[0];
  //       if (firstQuestion) {
  //         state.setCurrentQuestion(firstQuestion);
  //       }
  //       return;
  //     }
  //   }

  //   // Only submit if entire test timer is up
  //   if (state.entireTestTimer === 0) {
  //     set({ isSubmitted: true });
  //   }
  // },
  moveToNextAvailableSection: () => {
    const state = get();
    if (!state.assessment) return;

    // Find next available section
    const nextSectionIndex = state.findNextAvailableSection();

    if (nextSectionIndex !== null) {
      // Update section timers
      const updatedTimers = { ...state.sectionTimers };
      
      // Stop current section timer
      if (updatedTimers[state.currentSection]) {
        updatedTimers[state.currentSection].isRunning = false;
      }

      // Start next section timer
      updatedTimers[nextSectionIndex].isRunning = true;

      // Set first question of new section
      const firstQuestion = state.assessment.sections[nextSectionIndex].questions[0];

      set({
        currentSection: nextSectionIndex,
        currentQuestion: firstQuestion,
        sectionTimers: updatedTimers
      });
    } else {
      // If no sections available and entire test time is up, submit the test
      if (state.entireTestTimer <= 0) {
        set({ isSubmitted: true });
      }
    }
  },
  moveToNextQuestion: () => {
    const state = get()
    const { assessment, currentSection, currentQuestion } = state
    if (!assessment || !currentQuestion) return

    const currentSectionQuestions = assessment.sections[currentSection].questions
    const currentIndex = currentSectionQuestions.findIndex(q => q.questionId === currentQuestion.questionId)
    
    if (currentIndex < currentSectionQuestions.length - 1) {
      state.setCurrentQuestion(currentSectionQuestions[currentIndex + 1])
    } else {
      state.moveToNextAvailableSection()
    }
  },
  entireTestTimer: 0,
  setEntireTestTimer: (time) => set({ entireTestTimer: time }),
  updateEntireTestTimer: () => set((state) => ({
    entireTestTimer: Math.max(0, state.entireTestTimer - 1000)
  })),
  saveResponses: async () => {
    const state = get()
    const jsonApiResponse: JSONAPIResponse = {
      response: Object.entries(state.answers).map(([questionId, optionIds]) => ({
        MarkedResponse: {
          questionId,
          timeTakenForQuestion: "", // Calculate this based on the initial question duration and the time left
          questionDurationLeft: String(state.questionTimers[questionId] || 0),
          correctOptionsIds: {
            questionType: optionIds.length > 1 ? "MCQ (Multiple Correct)" : "MCQ (Single Correct)",
            optionIds
          }
        }
      })),
      testDuration: {
        entireTestDurationLeft: `${Math.floor(state.entireTestTimer / 60000)}:${String(Math.floor((state.entireTestTimer % 60000) / 1000)).padStart(2, '0')}`,
        sectionWiseDurationLeft: Object.values(state.sectionTimers).map(timer => 
          `${Math.floor(timer.timeLeft / 60000)}:${String(Math.floor((timer.timeLeft % 60000) / 1000)).padStart(2, '0')}`
        )
      }
    }

    await Storage.set({
      key: 'JSON_API_RESPONSE',
      value: JSON.stringify(jsonApiResponse)
    })
  },
  loadResponses: async () => {
    const { value } = await Storage.get({ key: 'JSON_API_RESPONSE' })
    if (value) {
      const jsonApiResponse: JSONAPIResponse = JSON.parse(value)
      set((state) => {
        const answers: Record<string, string[]> = {}
        const questionStates: Record<string, QuestionState> = { ...state.questionStates }
        const questionTimers: Record<string, number> = { ...state.questionTimers }

        jsonApiResponse.response.forEach(({ MarkedResponse }) => {
          answers[MarkedResponse.questionId] = MarkedResponse.correctOptionsIds.optionIds
          questionStates[MarkedResponse.questionId] = {
            ...questionStates[MarkedResponse.questionId],
            isAnswered: MarkedResponse.correctOptionsIds.optionIds.length > 0,
            isDisabled: parseInt(MarkedResponse.questionDurationLeft) === 0
          }
          questionTimers[MarkedResponse.questionId] = parseInt(MarkedResponse.questionDurationLeft)
        })

        const [hours, minutes] = jsonApiResponse.testDuration.entireTestDurationLeft.split(':').map(Number)
        const entireTestTimer = (hours * 60 + minutes) * 60 * 1000

        const sectionTimers: Record<number, SectionTimer> = {}
        jsonApiResponse.testDuration.sectionWiseDurationLeft.forEach((duration, index) => {
          const [minutes, seconds] = duration.split(':').map(Number)
          sectionTimers[index] = {
            timeLeft: (minutes * 60 + seconds) * 1000,
            isRunning: index === state.currentSection
          }
        })

        return { answers, questionStates, questionTimers, entireTestTimer, sectionTimers }
      })
    }
  },
  isSectionComplete: (sectionIndex: number) => {
    const state = get();
    if (!state.assessment) return false;

    const section = state.assessment.sections[sectionIndex];
    if (!section) return false;

    // A section is complete if its timer is at 0 or all questions are answered
    return (
      state.sectionTimers[sectionIndex]?.timeLeft === 0 ||
      section.questions.every(
        question => state.questionStates[question.questionId]?.isAnswered
      )
    );
  },

  // Add new helper method to check if section is available
  isSectionAvailable: (sectionIndex: number) => {
    const state = get();
    if (!state.assessment) return false;

    if (!state.assessment.testDuration.sectionWiseDuration) {
      // If no section-wise duration, all sections are available
      return true;
    }

    if (state.assessment.canSwitchSections) {
      return state.sectionTimers[sectionIndex]?.timeLeft > 0;
    }

    // If canSwitchSections is false, section is only available if all previous sections are complete
    return [...Array(sectionIndex)].every((_, idx) => 
      state.sectionTimers[idx]?.timeLeft === 0
    ) && state.sectionTimers[sectionIndex]?.timeLeft > 0;
  }
}));