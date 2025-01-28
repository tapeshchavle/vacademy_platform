import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { SubjectMaterial } from '@/components/common/study-library/subject-material/subject-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/subjects/',
)({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <LayoutContainer>
      <SubjectMaterial />
    </LayoutContainer>
  )
}
