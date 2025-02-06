import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { LevelMaterial } from '@/components/common/study-library/level-material/level-material'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/$course/levels/')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <LayoutContainer>
      <LevelMaterial />
    </LayoutContainer>
  )
}
