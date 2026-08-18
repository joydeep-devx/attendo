import { Link } from 'react-router-dom'

const TONE_CLASSES = {
  neutral: 'text-ink',
  ready: 'text-present',
  missing: 'text-amber',
  failed: 'text-absent',
}

function StatCard({ label, value, hint, to, tone = 'neutral' }) {
  const content = (
    <>
      <span className="font-mono text-xs uppercase tracking-wide text-slate">{label}</span>
      <span className={`mt-2 block font-display text-3xl ${TONE_CLASSES[tone]}`}>{value}</span>
      {hint && <span className="mt-1 block text-xs text-slate-soft">{hint}</span>}
    </>
  )

  const base = 'block rounded-lg border border-line bg-paper-raised p-5 transition-all duration-200'

  if (to) {
    return (
      <Link to={to} className={`${base} hover:-translate-y-0.5 hover:border-indigo-soft hover:shadow-md`}>
        {content}
      </Link>
    )
  }

  return <div className={base}>{content}</div>
}

export default StatCard