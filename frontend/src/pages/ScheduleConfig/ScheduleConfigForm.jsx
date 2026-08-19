import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Plus, X } from 'lucide-react'
import Field from '../../components/Field'
import { getTimeSlots } from '../../services/timeSlot.service'
import {
  createScheduleConfig,
  getScheduleConfig,
  updateScheduleConfig,
} from '../../services/scheduleConfig.service'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const initialFormState = {
  department: '',
  semester: '',
  section: '',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timeSlots: [],
  breaks: [],
}

function ScheduleConfigForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormState)
  const [availableSlots, setAvailableSlots] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const slots = await getTimeSlots()
        setAvailableSlots(slots)

        if (isEditMode) {
          const config = await getScheduleConfig(id)
          setFormData({
            department: config.department,
            semester: String(config.semester),
            section: config.section,
            workingDays: config.workingDays,
            timeSlots: config.timeSlots.map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
            breaks: config.breaks.map((item) => ({
              name: item.name,
              startTime: item.startTime,
              endTime: item.endTime,
            })),
          })
        }
        setStatus('idle')
      } catch (error) {
        setErrorMessage(error.message)
        setStatus('error')
      }
    }
    load()
  }, [id, isEditMode])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function toggleDay(day) {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }))
  }

  function isSlotSelected(slot) {
    return formData.timeSlots.some(
      (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
    )
  }

  function toggleSlot(slot) {
    setFormData((prev) => ({
      ...prev,
      timeSlots: isSlotSelected(slot)
        ? prev.timeSlots.filter(
            (s) => !(s.startTime === slot.startTime && s.endTime === slot.endTime)
          )
        : [...prev.timeSlots, { startTime: slot.startTime, endTime: slot.endTime }],
    }))
  }

  function addBreak() {
    setFormData((prev) => ({
      ...prev,
      breaks: [...prev.breaks, { name: '', startTime: '', endTime: '' }],
    }))
  }

  function updateBreak(index, key, value) {
    setFormData((prev) => ({
      ...prev,
      breaks: prev.breaks.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }))
  }

  function removeBreak(index) {
    setFormData((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (formData.workingDays.length === 0) {
      setErrorMessage('Select at least one working day.')
      return
    }
    if (formData.timeSlots.length === 0) {
      setErrorMessage('Select at least one time slot.')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    const payload = {
      department: formData.department,
      semester: Number(formData.semester),
      section: formData.section,
      workingDays: formData.workingDays,
      timeSlots: formData.timeSlots,
      breaks: formData.breaks,
    }

    try {
      if (isEditMode) {
        await updateScheduleConfig(id, payload)
      } else {
        await createScheduleConfig(payload)
      }
      navigate('/schedule-config')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('idle')
    }
  }

  if (status === 'loading') {
    return <p className="text-slate">Loading…</p>
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/schedule-config"
        className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo"
      >
        ← Back to Schedule Configuration
      </Link>

      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">
        {isEditMode ? 'Edit Configuration' : 'New Configuration'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-lg border border-line bg-paper-raised p-6">
          <h2 className="mb-4 font-display text-base text-ink">Applies to</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. CSE"
              required
            />
            <Field
              label="Semester"
              name="semester"
              type="number"
              min="1"
              max="8"
              value={formData.semester}
              onChange={handleChange}
              placeholder="1–8"
              required
            />
            <Field
              label="Section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              placeholder="e.g. A"
              required
            />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper-raised p-6">
          <h2 className="font-display text-base text-ink">Working days</h2>
          <p className="mt-1 text-xs text-slate">
            {formData.timeSlots.length} of {availableSlots.length} selected
          </p>
          {console.log('selected:', formData.timeSlots)}
          <div className="mt-4 flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const isSelected = formData.workingDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-md border px-4 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-indigo bg-indigo-soft font-medium text-indigo-dark'
                      : 'border-line text-slate hover:border-indigo hover:text-indigo'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-paper-raised p-6">
          <h2 className="font-display text-base text-ink">Time slots</h2>
          <p className="mt-1 text-xs text-slate">
            {formData.timeSlots.length} of {availableSlots.length} selected
          </p>

          {availableSlots.length === 0 ? (
            <p className="mt-4 rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">
              No time slots exist yet. Add them under Time Slots first.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {availableSlots.map((slot) => {
                const isSelected = isSlotSelected(slot)
                return (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all duration-200 hover:translate-x-1 ${
                      isSelected
                        ? 'border-indigo bg-indigo-soft'
                        : 'border-dashed border-line hover:border-indigo'
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded transition-colors ${
                        isSelected ? 'bg-indigo text-white' : 'bg-line-soft text-slate-soft'
                      }`}
                    >
                      {isSelected ? <Check size={12} /> : <Plus size={12} />}
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-indigo-dark' : 'text-slate'}`}>
                      {slot.name}
                    </span>
                    <span className="ml-auto font-mono text-xs text-slate-soft">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base text-ink">Breaks</h2>
            <button
              type="button"
              onClick={addBreak}
              className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-slate transition-colors hover:border-indigo hover:text-indigo"
            >
              <Plus size={14} />
              Add break
            </button>
          </div>

          {formData.breaks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-soft">No breaks configured.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {formData.breaks.map((item, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field
                      label="Name"
                      value={item.name}
                      onChange={(e) => updateBreak(index, 'name', e.target.value)}
                      placeholder="e.g. Lunch"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Field
                      label="Start"
                      type="time"
                      value={item.startTime}
                      onChange={(e) => updateBreak(index, 'startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Field
                      label="End"
                      type="time"
                      value={item.endTime}
                      onChange={(e) => updateBreak(index, 'endTime', e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBreak(index)}
                    className="mb-2 rounded-md p-2 text-slate-soft transition-colors hover:bg-absent-soft hover:text-absent"
                    aria-label="Remove break"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/schedule-config"
            className="px-4 py-2 text-sm text-slate hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
          >
            {status === 'submitting' ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ScheduleConfigForm