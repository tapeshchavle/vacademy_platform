import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-library/courses/"!</div>
}
