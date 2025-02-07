import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { ChapterMaterial } from '@/components/common/study-library/level-material/subject-material/module-material/chapter-material/chapter-material'
import { useEffect, useState } from 'react'
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore'
import { getSubjectName } from '@/utils/study-library/get-name-by-id/getSubjectNameById'
import { CaretLeft } from 'phosphor-react'
import { ChapterSidebarComponent } from '@/components/common/study-library/level-material/subject-material/module-material/chapter-material/chapter-sidebar-component'
import { InitStudyLibraryProvider } from '@/providers/study-library/init-study-library-provider'
import { ModulesWithChaptersProvider } from '@/providers/study-library/modules-with-chapters-provider'

interface ModulesSearchParams {
  courseId: string
  levelId: string
  subjectId: string
  moduleId: string
}

export const Route = createFileRoute(
  '/study-library/courses/levels/subjects/modules/chapters/',
)({
  component: ModuleMaterialPage,
  validateSearch: (search: Record<string, unknown>): ModulesSearchParams => {
    return {
      courseId: search.courseId as string,
      levelId: search.levelId as string,
      subjectId: search.subjectId as string,
      moduleId: search.moduleId as string,
    }
  },
})

function ModuleMaterialPage() {
  const navigate = useNavigate();

    const { courseId, levelId, subjectId, moduleId } = Route.useSearch();

    const [currentModuleId, setCurrentModuleId] = useState(moduleId);

    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        navigate({
            to: "/study-library/courses/levels/subjects/modules/chapters",
            search: {
                courseId,
                levelId,
                subjectId,
                moduleId: currentModuleId,
            },
            replace: true,
        });
    }, [currentModuleId, courseId, levelId, subjectId]);

    // Module page heading
    const subjectName = getSubjectName(subjectId);

    const handleBackClick = () => {
        navigate({
            to: `/study-library/courses/levels/subjects/modules`,
            search: {
                courseId,
                levelId,
                subjectId,
            },
        });
    };

    const heading = (
        <div className="flex items-center gap-4">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer" />
            <div>{`${subjectName}`}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

  return (
    <LayoutContainer sidebarComponent={<ChapterSidebarComponent
      currentModuleId={currentModuleId}
      setCurrentModuleId={setCurrentModuleId}
  />}>
  <InitStudyLibraryProvider>
      <ModulesWithChaptersProvider subjectId={subjectId}>
      <ChapterMaterial currentModuleId={currentModuleId} />
      </ModulesWithChaptersProvider>
      </InitStudyLibraryProvider>
    </LayoutContainer>
  )
}
