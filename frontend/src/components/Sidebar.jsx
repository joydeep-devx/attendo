import { NavLink , useNavigate} from 'react-router-dom'
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
  LogOut,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['ADMIN'] },
  { label: 'Teachers', path: '/teachers', icon: Users, roles: ['ADMIN'] },
  { label: 'Classrooms', path: null, icon: DoorOpen, roles: ['ADMIN'] },
  { label: 'Time Slots', path: '/time-slots', icon: Clock, roles: ['ADMIN'] },
  { label: 'Configuration', path: '/schedule-config', icon: SlidersHorizontal, roles: ['ADMIN'] },
  { label: 'Timetable', path: null, icon: CalendarDays, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { label: 'Attendance', path: null, icon: ClipboardCheck, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role))

  async function handleLogout() {
    await logout()
    navigate('/login')
  }
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
          {visibleItems.map((item) => {
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

        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-2">
          <div className={rowBase}>
            <span className={iconBox}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-soft font-mono text-xs font-medium text-indigo">
                {user?.username?.slice(0, 2).toUpperCase() || '··'}
              </span>
            </span>
            <span className={`${label(isCollapsed)} flex flex-col`}>
              <span className="text-sm text-ink">{user?.username}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-soft">
                {user?.role}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Sign out' : undefined}
            className={`${rowBase} text-slate hover:bg-absent-soft hover:text-absent`}
          >
            <span className={iconBox}>
              <LogOut size={20} />
            </span>
            <span className={label(isCollapsed)}>Sign out</span>
          </button>

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
        </div>
      </aside>
    </>
  )
}

export default Sidebar