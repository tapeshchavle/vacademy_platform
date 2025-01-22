import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SearchInput } from '@/components/common/search-input'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { SidebarFooter, useSidebar } from '@/components/ui/sidebar'
import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { truncateString } from '@/lib/reusable/truncateString'

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
      to: '..',
      params: {},
      search: { moduleName },
      hash: '',
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSearch(e.target.value)
  }

  const trucatedChapterName = truncateString(chapterParam, 9)

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
        </div>
      </div>
      <SidebarFooter className="absolute bottom-0 flex w-full items-center justify-center py-10"></SidebarFooter>
    </div>
  )

  return (
    <LayoutContainer sidebarComponent={SidebarComponent}>
      Welcome to Chapter material page
    </LayoutContainer>
  )
}
