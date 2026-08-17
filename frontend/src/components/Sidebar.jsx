import { NavLink } from 'react-router-dom'

// path: null means "not built yet" — rendered disabled instead of a real link
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Subjects', path: '/subjects' },
  { label: 'Teachers', path: '/teachers' },
  { label: 'Classrooms', path: null },
  { label: 'Time Slots', path: null },
  { label: 'Schedule Configuration', path: null },
  { label: 'Timetable', path: null },
  { label: 'Attendance', path: null },
]

const baseLink = 'block rounded-sm px-2.5 py-2 text-sm transition-colors'

function Sidebar() {
  return (
    <aside className="w-55 shrink-0 border-r border-line bg-paper px-4 py-5">
      <div className="mb-5 px-2 font-display text-lg font-semibold tracking-tight text-ink">
        Attendo
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) =>
          item.path ? (
            <NavLink
              key={item.label}
              to={item.path}
              end
              className={({ isActive }) =>
                isActive
                  ? `${baseLink} bg-indigo-soft font-semibold text-indigo`
                  : `${baseLink} text-slate hover:bg-line-soft hover:text-ink`
              }
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              className={`${baseLink} cursor-default text-slate-soft`}
            >
              {item.label}
            </span>
          )
        )}
      </nav>
    </aside>
  )
}

export default Sidebar