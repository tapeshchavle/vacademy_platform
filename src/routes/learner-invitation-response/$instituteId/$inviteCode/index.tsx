import EnrollByInvite from '@/components/common/enroll-by-invite/enroll-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/learner-invitation-response/$instituteId/$inviteCode/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <EnrollByInvite />
  )
}
