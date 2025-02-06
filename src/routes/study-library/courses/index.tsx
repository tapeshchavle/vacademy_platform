import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { CourseMaterial } from '@/components/common/study-library/course-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <LayoutContainer>
      <CourseMaterial />
    </LayoutContainer>
  )
}