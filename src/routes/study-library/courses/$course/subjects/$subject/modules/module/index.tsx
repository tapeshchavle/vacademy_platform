import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/subjects/$subject/modules/module/',
)({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/study-library/courses/$course/subjects/$subject/modules/module/chapters',
      params: {
        course: params.course,
        subject: params.subject,
      },
      search: search,
    })
  },
})
