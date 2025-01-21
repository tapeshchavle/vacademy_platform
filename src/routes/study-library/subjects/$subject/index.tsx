import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { ModuleMaterial } from '@/components/common/study-library/module-material/module-material';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/subjects/$subject/')({
  component: RouteComponent,
})

function RouteComponent() {
  const {subject} = Route.useParams();

  return (
    <LayoutContainer>
      <ModuleMaterial subject={subject} />
    </LayoutContainer>
  )
}
