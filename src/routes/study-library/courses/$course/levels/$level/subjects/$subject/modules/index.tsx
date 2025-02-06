import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { ModuleMaterial } from '@/components/common/study-library/level-material/subject-material/module-material/module-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/levels/$level/subjects/$subject/modules/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { subject, level, course } = Route.useParams()

  return (
    <LayoutContainer>
      <ModuleMaterial
        subject={subject.charAt(0).toUpperCase() + subject.slice(1)}
        course={course}
        level={level}
      />
    </LayoutContainer>
  )
}
