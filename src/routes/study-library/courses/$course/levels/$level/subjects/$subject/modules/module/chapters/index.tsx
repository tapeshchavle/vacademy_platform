import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LayoutContainer } from '@/components/common/layout-container/layout-container'
import { useSidebar } from '@/components/ui/sidebar'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import { ChapterMaterial } from '@/components/common/study-library/level-material/subject-material/module-material/chapter-material/chapter-material'

interface ModuleSearchParams {
  moduleName?: string
}

export const Route = createFileRoute(
  '/study-library/courses/$course/levels/$level/subjects/$subject/modules/module/chapters/',
)({
  component: ModuleMaterialPage,
  validateSearch: (search: Record<string, unknown>): ModuleSearchParams => {
    return {
      moduleName: search.moduleName as string | undefined,
    }
  },
})

function ModuleMaterialPage() {
  const { subject, level, course } = Route.useParams()
  const { moduleName } = Route.useSearch()

  //Sidebar component
  const { open } = useSidebar()
  const data = [
    {
      id: 'M1',
      name: 'Live Session',
    },
  ]
  const navigate = useNavigate()
  const handleSubjectRoute = () => {
    navigate({
      to: '/study-library/courses/$course/levels/$level/subjects/$subject/modules',
      params: { course, level, subject },
      search: {},
      hash: '',
    })
  }

  const SidebarComponent = (
    <div className={`flex w-full flex-col gap-6 ${open ? 'px-10' : 'px-6'}`}>
      <div className="flex flex-wrap items-center gap-1 text-neutral-500">
        <p
          className={`cursor-pointer ${open ? 'visible' : 'hidden'} text-subtitle`}
          onClick={handleSubjectRoute}
        >
          {subject}
        </p>
        <ChevronRightIcon
          className={`size-4 ${open ? 'visible' : 'hidden'} text-subtitle`}
        />
        <p className="cursor-pointer text-primary-500 text-subtitle">
          {moduleName}
        </p>
      </div>
      {data?.map((obj, key) => (
        <div
          key={key}
          className="flex w-full items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-primary-500 hover:cursor-pointer hover:border hover:border-neutral-300 hover:bg-white hover:text-primary-500"
        >
          <p className="text-h3 font-semibold">{obj.id}</p>
          <p className={`${open ? 'visible' : 'hidden'}`}>{obj.name}</p>
        </div>
      ))}
    </div>
  )

  // Module page heading

  return (
    <LayoutContainer sidebarComponent={SidebarComponent}>
      <ChapterMaterial subject={subject} course={course} level={level} />
    </LayoutContainer>
  )
}
