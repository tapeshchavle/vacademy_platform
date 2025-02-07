import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { LevelMaterial } from '@/components/common/study-library/level-material/level-material'
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider'
import { createFileRoute } from '@tanstack/react-router'

interface CourseSearchParams {
  courseId: string
}

export const Route = createFileRoute('/study-library/courses/levels/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): CourseSearchParams => {
    return {
      courseId: search.courseId as string,
    }
  },
})

function RouteComponent() {
  return (
    <LayoutContainer>
      <InitStudyLibraryProvider>
        <LevelMaterial />
      </InitStudyLibraryProvider>
    </LayoutContainer>
  )
}
