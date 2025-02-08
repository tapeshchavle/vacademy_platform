import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SearchInput } from '@/components/common/search-input'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import {  useSidebar } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { truncateString } from '@/lib/reusable/truncateString'
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore'
import { CaretLeft } from 'phosphor-react'
import { SlideMaterial } from '@/components/common/study-library/level-material/subject-material/module-material/chapter-material/slide-material/slide-material'
import { ChapterSidebarSlides } from '@/components/common/study-library/level-material/subject-material/module-material/chapter-material/slide-material/chapter-sidebar-slides'
import { getModuleName } from '@/utils/study-library/get-name-by-id/getModuleNameById'
import { getSubjectName } from '@/utils/study-library/get-name-by-id/getSubjectNameById'
import { getChapterName } from '@/utils/study-library/get-name-by-id/getChapterById'

interface ChapterSearchParams {
  subjectId: string
  moduleId: string
  chapterId: string
  slideId: string
}

export const Route = createFileRoute(
  '/study-library/courses/levels/subjects/modules/chapters/slides/',
)({
  component: Chapters,
  validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
    return {
      subjectId: search.subjectId as string,
      moduleId: search.moduleId as string,
      chapterId: search.chapterId as string,
      slideId: search.slideId as string,
    }
  },
})

function Chapters() {
  const {subjectId, moduleId, chapterId} = Route.useSearch();
  const [inputSearch, setInputSearch] = useState("");
  const { open, state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleSubjectRoute = () => {
      navigate({
          to: "/study-library/courses/levels/subjects/modules",
          params: {},
          search: {
              subjectId: subjectId,
          },
          hash: "",
      });
  };

  const handleModuleRoute = () => {
      navigate({
          to: "/study-library/courses/levels/subjects/modules/chapters",
          params: {},
          search: {
              subjectId: subjectId,
              moduleId: moduleId,
          },
          hash: "",
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputSearch(e.target.value);
  };


  const subjectName = getSubjectName(subjectId);
  const moduleName = getModuleName(moduleId);
  const chapterName = getChapterName(chapterId);
  const trucatedChapterName = truncateString(chapterName || "", 9);


  const SidebarComponent = (
      <div className="flex w-full flex-col items-center">
          <div className={`flex w-full flex-col gap-6 ${open ? "px-6" : "px-6"} -mt-10`}>
              <div className="flex flex-wrap items-center gap-1 text-neutral-500">
                  <p
                      className={`cursor-pointer ${open ? "visible" : "hidden"}`}
                      onClick={handleSubjectRoute}
                  >
                      {subjectName}
                  </p>
                  <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                  <p
                      className={`cursor-pointer ${open ? "visible" : "hidden"}`}
                      onClick={handleModuleRoute}
                  >
                      {moduleName}
                  </p>
                  <ChevronRightIcon className={`size-4 ${open ? "visible" : "hidden"}`} />
                  <p className="cursor-pointer text-primary-500">
                      {open ? chapterName : trucatedChapterName}
                  </p>
              </div>
              <div className="flex w-full flex-col items-center gap-6">
                  {open ? (
                      <SearchInput
                          searchInput={inputSearch}
                          placeholder="Search chapters"
                          onSearchChange={handleSearchChange}
                      />
                  ) : (
                      <MagnifyingGlass
                          className="size-5 cursor-pointer text-neutral-500"
                          onClick={() => {
                              if (state === "collapsed") toggleSidebar();
                          }}
                      />
                  )}
                  <ChapterSidebarSlides />
              </div>
          </div>
      </div>
  );

  const { setNavHeading } = useNavHeadingStore();


  const handleBackClick = () => {
      navigate({
          to: `/study-library/courses/levels/subjects/modules/chapters`,
          search: {
              subjectId,
              moduleId,
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
    <LayoutContainer sidebarComponent={SidebarComponent}>
      <SlideMaterial />
    </LayoutContainer>
  )
}
