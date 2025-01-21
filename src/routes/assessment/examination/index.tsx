import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { createFileRoute } from '@tanstack/react-router'
import { ScheduleTestMainComponent } from './-components/ScheduleTestMainComponent'
import { ScrollRestoration } from '@tanstack/react-router'

export const Route = createFileRoute('/assessment/examination/')({
  component: () => (
    <LayoutContainer>
      <ScrollRestoration />
      <ScheduleTestMainComponent />
    </LayoutContainer>
  ),
})
