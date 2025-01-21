import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/subjects/$subject/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-library/subjects/$subject/"!</div>
}
