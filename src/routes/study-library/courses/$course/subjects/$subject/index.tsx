import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/subjects/$subject/',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/study-library/courses/$course/subjects/$subject/modules',
      params: {
        course: params.course,
        subject: params.subject,
      },
    })
  },
})
