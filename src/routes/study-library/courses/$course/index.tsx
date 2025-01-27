import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/$course/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/study-library/courses/$course/"!</div>
}
