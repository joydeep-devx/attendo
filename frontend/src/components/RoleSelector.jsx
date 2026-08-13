const ROLES = [
  { value: 'student', label: 'Student', enabled: true },
  { value: 'teacher', label: 'Teacher', enabled: false },
  { value: 'admin', label: 'Admin', enabled: false },
]

function RoleSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-slate">Role</span>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((role) => {
          const isSelected = value === role.value

          if (!role.enabled) {
            return (
              <span
                key={role.value}
                title="Coming soon"
                className="cursor-not-allowed rounded-md border border-line-soft px-3 py-2 text-center text-sm text-slate-soft"
              >
                {role.label}
              </span>
            )
          }

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`rounded-md border px-3 py-2 text-sm transition-all duration-150 ${
                isSelected
                  ? 'border-indigo bg-indigo-soft font-medium text-indigo-dark'
                  : 'border-line text-slate hover:border-slate-soft hover:text-ink'
              }`}
            >
              {role.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RoleSelector