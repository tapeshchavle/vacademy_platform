import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/subjects/$subject/',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/study-library/subjects/$subject/modules',
      params: {
        subject: params.subject,
      },
    })
  },
})
