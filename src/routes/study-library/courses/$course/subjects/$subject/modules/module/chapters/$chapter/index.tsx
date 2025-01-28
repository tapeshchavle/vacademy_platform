import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/courses/$course/subjects/$subject/modules/module/chapters/$chapter/',
)({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/study-library/courses/$course/subjects/$subject/modules/module/chapters/$chapter/slides',
      params: {
        course: params.course,
        subject: params.subject,
        chapter: params.chapter,
      },
      search: search,
    })
  },
})
