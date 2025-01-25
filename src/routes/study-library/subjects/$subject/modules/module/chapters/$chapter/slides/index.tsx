import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { SearchInput } from '@/components/common/search-input'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { SidebarFooter, useSidebar } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { truncateString } from '@/lib/reusable/truncateString'
import { ChapterSidebarSlides } from '@/components/common/study-library/module-material/chapter-material/slide-material/chapter-sidebar-slides'
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore'
import { CaretLeft } from 'phosphor-react'
import { SlideMaterial } from '@/components/common/study-library/module-material/chapter-material/slide-material/slide-material'

interface ChapterSearchParams {
  moduleName?: string
}

export const Route = createFileRoute(
  '/study-library/subjects/$subject/modules/module/chapters/$chapter/slides/',
)({
  component: Chapters,
  validateSearch: (search: Record<string, unknown>): ChapterSearchParams => {
    return {
      moduleName: search.moduleName as string | undefined,
    }
  },
})

function Chapters() {
  const params = Route.useParams()
  const { subject, chapter: chapterParam } = Route.useParams()
  const search = Route.useSearch()
  const moduleName = search.moduleName
  const [inputSearch, setInputSearch] = useState('')
  const { open, state, toggleSidebar } = useSidebar()

  const navigate = useNavigate()

  const handleSubjectRoute = () => {
    navigate({
      to: '/study-library/subjects/$subject',
      params: {
        subject: params.subject,
      },
      search: {},
      hash: '',
    })
  }

  const handleModuleRoute = () => {
    navigate({
      to: '/study-library/subjects/$subject/modules/module/chapters',
      params: {subject},
      search: { moduleName },
      hash: '',
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSearch(e.target.value)
  }

  const trucatedChapterName = truncateString(chapterParam, 9)

  const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();


    const handleBackClick = () => {
        router.navigate({
            to: `/study-library/subjects/${subject}/modules/module`,
            search: {moduleName}
        });
    };

    const heading = (
        <div className="flex items-center gap-2">
            <CaretLeft onClick={handleBackClick} className="cursor-pointer size-5" />
            <div>{subject}</div>
        </div>
    );

    useEffect(() => {
        setNavHeading(heading);
    }, []);

  const SidebarComponent = (
    <div className="flex w-full flex-col items-center">
      <div
        className={`flex w-full flex-col gap-6 ${open ? 'px-6' : 'px-6'} -mt-10`}
      >
        <div className="flex flex-wrap items-center gap-1 text-neutral-500">
          <p
            className={`cursor-pointer ${open ? 'visible' : 'hidden'}`}
            onClick={handleSubjectRoute}
          >
            {subject}
          </p>
          <ChevronRightIcon
            className={`size-4 ${open ? 'visible' : 'hidden'}`}
          />
          <p
            className={`cursor-pointer ${open ? 'visible' : 'hidden'}`}
            onClick={handleModuleRoute}
          >
            {moduleName}
          </p>
          <ChevronRightIcon
            className={`size-4 ${open ? 'visible' : 'hidden'}`}
          />
          <p className="cursor-pointer text-primary-500">
            {open ? chapterParam : trucatedChapterName}
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
                if (state === 'collapsed') toggleSidebar()
              }}
            />
          )}
          <ChapterSidebarSlides />
        </div>
      </div>
      <SidebarFooter className="absolute bottom-0 flex w-full items-center justify-center py-10"></SidebarFooter>
    </div>
  )

  return (
    <LayoutContainer sidebarComponent={SidebarComponent}>
       <SlideMaterial />
    </LayoutContainer>
  )
}
