import EnrollByInvite from '@/components/common/enroll-by-invite/enroll-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/enroll/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EnrollByInvite />
}
