import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { SubjectMaterial } from '@/components/common/study-library/subject-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/subjects/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <LayoutContainer>
      <SubjectMaterial />
    </LayoutContainer>
  )
}
