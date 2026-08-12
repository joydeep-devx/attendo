import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const PERIODS = ['09:00', '10:00', '11:00', '12:00']

const CLASSES = [
  { day: 0, period: 0, code: 'CS501', room: 'R-301' },
  { day: 0, period: 2, code: 'CS503', room: 'R-301' },
  { day: 1, period: 1, code: 'CS502', room: 'R-204' },
  { day: 1, period: 3, code: 'CS501', room: 'R-301' },
  { day: 2, period: 0, code: 'CS503', room: 'R-204' },
  { day: 2, period: 3, code: 'CS502', room: 'R-301' },
  { day: 3, period: 2, code: 'CS501', room: 'R-204' },
  { day: 4, period: 0, code: 'CS502', room: 'R-204' },
  { day: 4, period: 2, code: 'CS-L1', room: 'CSE Lab 1', span: 2 },
]

const STATUS = [
  { label: 'Generating', text: 'Placing classes across 5 working days', tone: 'text-slate' },
  { label: 'Conflict', text: 'T001 is already teaching at WED 10:00', tone: 'text-absent' },
  { label: 'Resolved', text: 'Moved to THU 09:00 — no clashes remain', tone: 'text-present' },
]

function TimetablePreview() {
  const [phase, setPhase] = useState(0)
  const [cycle, setCycle] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setPhase(2)
      return
    }
    const timers = [
      setTimeout(() => setPhase(1), 2400),
      setTimeout(() => setPhase(2), 4400),
      setTimeout(() => {
        setPhase(0)
        setCycle((c) => c + 1)
      }, 8000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [cycle, reduceMotion])

  const conflict = phase >= 2 ? { day: 3, period: 0 } : { day: 2, period: 1 }
  const status = STATUS[phase]

  return (
    <div className="rounded-lg border border-line bg-paper-raised p-4">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: '48px repeat(5, minmax(0, 1fr))',
          gridTemplateRows: '24px repeat(4, 54px)',
        }}
      >
        {DAYS.map((day, i) => (
          <div
            key={day}
            style={{ gridColumn: i + 2, gridRow: 1 }}
            className="self-center font-mono text-[10px] uppercase tracking-wider text-slate-soft"
          >
            {day}
          </div>
        ))}

        {PERIODS.map((time, i) => (
          <div
            key={time}
            style={{ gridColumn: 1, gridRow: i + 2 }}
            className="pt-1 font-mono text-[10px] text-slate-soft"
          >
            {time}
          </div>
        ))}

        {DAYS.map((_, d) =>
          PERIODS.map((__, p) => (
            <div
              key={`slot-${d}-${p}`}
              style={{ gridColumn: d + 2, gridRow: p + 2 }}
              className="rounded-sm border border-dashed border-line-soft"
            />
          ))
        )}

        {CLASSES.map((item, index) => (
          <motion.div
            key={`${cycle}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : index * 0.13, duration: 0.3 }}
            style={{
              gridColumn: item.day + 2,
              gridRow: item.span
                ? `${item.period + 2} / span ${item.span}`
                : item.period + 2,
            }}
            className="flex flex-col justify-center rounded-sm border border-indigo-soft bg-indigo-soft px-2"
          >
            <span className="font-mono text-[11px] font-medium text-indigo-dark">{item.code}</span>
            <span className="text-[10px] text-slate">{item.room}</span>
          </motion.div>
        ))}

        {phase >= 1 && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            style={{ gridColumn: conflict.day + 2, gridRow: conflict.period + 2 }}
            className={`flex flex-col justify-center rounded-sm border px-2 ${
              phase === 1
                ? 'border-absent bg-absent-soft'
                : 'border-present bg-present-soft'
            }`}
          >
            <span
              className={`font-mono text-[11px] font-medium ${
                phase === 1 ? 'text-absent' : 'text-present'
              }`}
            >
              CS502
            </span>
            <span className="text-[10px] text-slate">{phase === 1 ? 'clash' : 'R-204'}</span>
          </motion.div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
        <span className={`font-mono text-[10px] uppercase tracking-wider ${status.tone}`}>
          {status.label}
        </span>
        <span className="text-xs text-slate">{status.text}</span>
      </div>
    </div>
  )
}

export default TimetablePreview