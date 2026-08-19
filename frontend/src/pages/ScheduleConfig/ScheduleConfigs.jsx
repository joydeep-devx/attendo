import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getScheduleConfigs } from '../../services/scheduleConfig.service'

function ScheduleConfigs() {
  const [configs, setConfigs] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setConfigs(await getScheduleConfigs())
        setStatus('success')
      } catch (error) {
        setErrorMessage(error.message)
        setStatus('error')
      }
    }
    load()
  }, [])

  function renderContent() {
    if (status === 'loading') {
      return <p className="text-slate">Loading configurations…</p>
    }

    if (status === 'error') {
      return (
        <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">{errorMessage}</p>
      )
    }

    if (configs.length === 0) {
      return (
        <div className="rounded-lg border border-line bg-paper-raised px-6 py-12 text-center">
          <p className="text-slate">No schedule configurations yet.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {configs.map((config) => (
          <Link
            key={config._id}
            to={`/schedule-config/${config._id}/edit`}
            className="rounded-lg border border-line bg-paper-raised p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-soft hover:shadow-md"
          >
            <span className="font-display text-lg text-ink">
              {config.department} · Sem {config.semester} · {config.section}
            </span>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {config.workingDays.map((day) => (
                <span
                  key={day}
                  className="rounded-sm bg-indigo-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-indigo"
                >
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate">
              {config.timeSlots.length} periods
              {config.breaks.length > 0 && ` · ${config.breaks.length} break${config.breaks.length > 1 ? 's' : ''}`}
            </p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Schedule Configuration</h1>
        <Link
          to="/schedule-config/new"
          className="rounded-md bg-indigo px-4 py-2 text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
        >
          Add Configuration
        </Link>
      </div>
      {renderContent()}
    </div>
  )
}

export default ScheduleConfigs