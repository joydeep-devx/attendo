import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createSubject } from '../../services/subject.service'

const initialFormState = {
  subjectCode: '',
  subjectName: '',
  department: '',
  semester: '',
  roomType: '',
  classesPerWeek: '',
  duration: '',
}

function Field({ label, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs uppercase tracking-wide text-slate">
        {label}
      </label>
      <input
        {...inputProps}
        className="rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo-soft"
      />
    </div>
  )
}

function SubjectForm() {
  const [formData, setFormData] = useState(initialFormState)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      await createSubject({
        ...formData,
        semester: Number(formData.semester),
        classesPerWeek: Number(formData.classesPerWeek),
        duration: Number(formData.duration),
      })
      navigate('/subjects')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-xl">
      <Link to="/subjects" className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo">
        ← Back to Subjects
      </Link>

      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">Add Subject</h1>

      <div className="rounded-lg border border-line bg-paper-raised p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Subject Code" name="subjectCode" value={formData.subjectCode} onChange={handleChange} placeholder="e.g. CS501" required />
          <Field label="Subject Name" name="subjectName" value={formData.subjectName} onChange={handleChange} placeholder="e.g. Database Management Systems" required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. CSE" required />
            <Field label="Semester" name="semester" type="number" min="1" max="8" value={formData.semester} onChange={handleChange} placeholder="1–8" required />
          </div>

          <Field label="Room Type" name="roomType" value={formData.roomType} onChange={handleChange} placeholder="e.g. CLASSROOM" required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Classes Per Week" name="classesPerWeek" type="number" min="1" value={formData.classesPerWeek} onChange={handleChange} placeholder="e.g. 3" required />
            <Field label="Duration" name="duration" type="number" min="1" value={formData.duration} onChange={handleChange} placeholder="Time-slot units" required />
          </div>

          {status === 'error' && (
            <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">{errorMessage}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <Link to="/subjects" className="px-4 py-2 text-sm text-slate hover:text-ink">Cancel</Link>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-50"
            >
              {status === 'submitting' ? 'Saving…' : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubjectForm