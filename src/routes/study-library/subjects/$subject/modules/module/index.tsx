import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/study-library/subjects/$subject/modules/module/',
)({
  beforeLoad: ({ params, search }) => {
    throw redirect({
      to: '/study-library/subjects/$subject/modules/module/chapters',
      params: {
        subject: params.subject,
      },
      search: search
    })
  },
})
