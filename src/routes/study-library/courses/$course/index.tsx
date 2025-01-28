import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/study-library/courses/$course/')({
  beforeLoad: ({params}) => {
      throw redirect({
          to: '/study-library/courses/$course/subjects',
          params: {course: params.course}
      })
    }
})



