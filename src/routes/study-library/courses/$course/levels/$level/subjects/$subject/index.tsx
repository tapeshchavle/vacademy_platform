import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/levels/$level/subjects/$subject/',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/study-library/courses/$course/levels/$level/subjects/$subject/modules',
      params: {
        course: params.course,
        level: params.level,
        subject: params.subject,
      },
    })
  },
})
