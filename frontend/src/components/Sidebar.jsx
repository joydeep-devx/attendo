import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  DoorOpen,
  Clock,
  SlidersHorizontal,
  CalendarDays,
  ClipboardCheck,
  PanelLeftClose,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Subjects', path: '/subjects', icon: BookOpen },
  { label: 'Teachers', path: '/teachers', icon: Users },
  { label: 'Classrooms', path: null, icon: DoorOpen },
  { label: 'Time Slots', path: null, icon: Clock },
  { label: 'Schedule Configuration', path: null, icon: SlidersHorizontal },
  { label: 'Timetable', path: null, icon: CalendarDays },
  { label: 'Attendance', path: null, icon: ClipboardCheck },
]

const rowBase =
  'group flex h-11 w-full items-center overflow-hidden rounded-md transition-colors duration-200'

const iconBox = 'grid h-11 w-12 shrink-0 place-items-center'

function label(isCollapsed) {
  return `whitespace-nowrap text-[15px] transition-opacity duration-200 ${
    isCollapsed ? 'lg:opacity-0' : 'opacity-100'
  }`
}

function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile, onToggleCollapse }) {
  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-line bg-paper px-3 py-4 transition-[width,transform] duration-300 ease-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
      >
        <div className="mb-4 flex h-11 items-center overflow-hidden">
          <span className={iconBox}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo font-display text-sm font-semibold text-white">
              S
            </span>
          </span>
          <span className={`${label(isCollapsed)} font-display text-lg font-semibold tracking-tight text-ink`}>
            Scheduler.ai
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon

            if (!item.path) {
              return (
                <span
                  key={item.label}
                  title={isCollapsed ? item.label : undefined}
                  className={`${rowBase} cursor-default text-slate-soft`}
                >
                  <span className={iconBox}>
                    <Icon size={20} />
                  </span>
                  <span className={label(isCollapsed)}>{item.label}</span>
                </span>
              )
            }

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  isActive
                    ? `${rowBase} bg-indigo-soft font-medium text-indigo`
                    : `${rowBase} text-slate hover:bg-line-soft hover:text-ink`
                }
              >
                <span className={iconBox}>
                  <Icon
                    size={20}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                </span>
                <span className={label(isCollapsed)}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`${rowBase} hidden text-slate hover:bg-line-soft hover:text-ink lg:flex`}
        >
          <span className={iconBox}>
            <PanelLeftClose
              size={20}
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </span>
          <span className={label(isCollapsed)}>Collapse</span>
        </button>
      </aside>
    </>
  )
}

export default Sidebar