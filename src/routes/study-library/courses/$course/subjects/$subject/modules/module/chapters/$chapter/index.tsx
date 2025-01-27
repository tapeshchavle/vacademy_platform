import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/subjects/$subject/modules/module/chapters/$chapter/',
)({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/study-library/subjects/$subject/modules/module/chapters/$chapter/slides',
      params: {
        subject: params.subject,
        chapter: params.chapter,
      },
      search: search,
    })
  },
})
