import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/levels/$level/subjects/$subject/modules/module/',
)({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/study-library/courses/$course/levels/$level/subjects/$subject/modules/module/chapters',
      params: {
        course: params.course,
        level: params.level,
        subject: params.subject,
      },
      search: search,
    })
  },
})
