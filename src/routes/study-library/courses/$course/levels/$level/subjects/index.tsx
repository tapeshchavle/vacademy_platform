import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { SubjectMaterial } from '@/components/common/study-library/level-material/subject-material/subject-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/levels/$level/subjects/',
)({
  component: RouteComponent,
})

function RouteComponent() {

  const {course} = Route.useParams(); 

  return (
    <LayoutContainer>
      <SubjectMaterial course={course} />
    </LayoutContainer>
  )
}
