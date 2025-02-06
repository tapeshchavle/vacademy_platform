import { cn, parseHtmlToString } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Flag } from 'lucide-react'
// import Image from 'next/image'
import { useAssessmentStore } from '@/stores/assessment-store'
import { QuestionDto, QuestionState } from '@/types/assessment'

export function QuestionListView() {
  const { 
    assessment,
    currentSection,
    currentQuestion,
    questionStates,
    setCurrentQuestion,
    setQuestionState,
    sectionTimers 
  } = useAssessmentStore()

  if (!assessment) return null

  const currentSectionQuestions = assessment.section_dtos[currentSection].question_preview_dto_list
  const isTimeUp = sectionTimers[currentSection]?.timeLeft === 0

  const handleQuestionClick = (question: QuestionDto) => {
    if (isTimeUp) return
    setCurrentQuestion(question)
    setQuestionState(question.question_id, { isVisited: true })
  }

  const getQuestionClass = (state: QuestionState) => {
    if (state.isAnswered) return 'border-green-200 bg-green-50'
    if (!state.isVisited) return 'border-gray-200'
    return 'border-pink-200 bg-pink-50'
  }

  return (
    <ScrollArea className="h-full pb-16">
      <div className="space-y-2 p-4">
        {currentSectionQuestions.map((question, index) => {
          const state = questionStates[question.question_id]
          const isActive = currentQuestion?.question_id === question.question_id
          
          return (
            <div
              key={question.question_id}
              className={cn(
                "relative rounded-lg border p-4 transition-colors",
                !isTimeUp && "cursor-pointer hover:bg-accent/50",
                isActive && "ring-2 ring-primary",
                state && getQuestionClass(state),
                isTimeUp && "opacity-50"
              )}
              onClick={() => handleQuestionClick(question)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}</span>
                  <span className="text-sm text-muted-foreground">
                    {/* MCQ (Single Correct) */}
                    {question.question_type}
                  </span>
                </div>
                {state?.isMarkedForReview && (
                  <Flag className="h-4 w-4 text-primary-500" />
                )}
              </div>
              <div className="text-sm line-clamp-2">{parseHtmlToString(question.question.content)}</div>
              {/* {question.imageDetails && question.imageDetails.length > 0 && (
                <div className="mt-2 relative h-20">
                  <Image
                    src="/placeholder.svg"
                    alt="Question preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )} */}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

