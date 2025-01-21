import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/subjects/$subject/$module/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-library/subjects/$subject/$module/"!</div>
}
