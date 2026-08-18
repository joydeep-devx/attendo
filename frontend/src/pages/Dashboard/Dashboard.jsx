import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSetupStatus } from '../../services/dashboard.service'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [resources, setResources] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      setStatus('success')
      return
    }

    async function load() {
      try {
        setResources(await getSetupStatus())
        setStatus('success')
      } catch (error) {
        setErrorMessage(error.message)
        setStatus('error')
      }
    }
    load()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate">
          Signed in as {user?.username}
        </p>

        <div className="mt-8 rounded-lg border border-line bg-paper-raised p-6">
          <p className="text-sm leading-relaxed text-slate">
            Your timetable and attendance views are coming in the next release.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return <p className="text-slate">Loading dashboard…</p>
  }

  if (status === 'error') {
    return (
      <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">
        {errorMessage}
      </p>
    )
  }

  const configured = resources.filter((r) => r.count > 0).length
  const blocking = resources.filter((r) => !r.failed && r.count === 0)
  const percent = Math.round((configured / resources.length) * 100)

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-slate">
        {configured} of {resources.length} data sets configured
      </p>

      <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-indigo transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          let tone = 'ready'
          let hint = null
          let value = resource.count

          if (resource.failed) {
            tone = 'failed'
            value = '—'
            hint = 'Not available yet'
          } else if (resource.count === 0) {
            tone = 'missing'
            hint = 'Nothing added yet'
          }

          return (
            <StatCard
              key={resource.key}
              label={resource.label}
              value={value}
              hint={hint}
              tone={tone}
              to={resource.route}
            />
          )
        })}
      </div>

      {blocking.length > 0 && (
        <div className="mt-8 rounded-lg border border-line bg-paper-raised p-5">
          <h2 className="font-display text-base text-ink">
            Before a timetable can be generated
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {blocking.map((resource) => (
              <li key={resource.key} className="flex items-center gap-3 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <span className="text-slate">
                  {resource.label} — none added yet
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/subjects/new"
          className="rounded-md bg-indigo px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
        >
          Add subject
        </Link>
        <Link
          to="/teachers/new"
          className="rounded-md border border-line bg-paper-raised px-4 py-2 text-sm text-ink transition-colors hover:border-indigo hover:text-indigo"
        >
          Add teacher
        </Link>
      </div>
    </div>
  )
}

export default Dashboard