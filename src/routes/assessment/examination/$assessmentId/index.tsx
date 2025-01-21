import { createFileRoute } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'

import InstructionPage from '@/components/common/instructionPage/InstructionPage'
import AssessmentInterface from '@/components/common/section/test'
import dummyAssessment from '../-utils.ts/dummyData'
import AssessmentWrapper from '@/components/common/section/test'
import Page from '@/components/common/questionLiveTest/page'
import { AssessmentPreview } from '@/components/common/questionLiveTest/assessment-preview'
// import { AssessmentPreview } from '@/components/common/questionLiveTest/assessment-preview'

export const Route = createFileRoute('/assessment/examination/$assessmentId/')({
  component: RouteComponent,
})
const assessmentPreview  = true
function RouteComponent() {
  return <AssessmentPreview />
  // return <InstructionPage assessment={dummyAssessment[0]} />
  // return <AssessmentInterface assessmentData={assessments[0]} />
  // return <dummyAssessment />
  // return <AssessmentWrapper/>
  // return <Page />
}