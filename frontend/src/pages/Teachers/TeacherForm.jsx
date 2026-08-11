import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createTeacher } from '../../services/teacher.service'
import Field from '../../components/Field'

const initialFormState = {
  name: '',
  employeeId: '',
  email: '',
  department: '',
  designation: '',
}

function TeacherForm() {
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
      await createTeacher(formData)
      navigate('/teachers')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('error')
    }
  }

  return (
    <div className="max-w-xl">
      <Link to="/teachers" className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo">
        ← Back to Teachers
      </Link>

      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">Add Teacher</h1>

      <div className="rounded-lg border border-line bg-paper-raised p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Dr. A. Sharma" required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="e.g. T001" required />
            <Field label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. CSE" required />
          </div>

          <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g. teacher@college.edu" required />
          <Field label="Designation" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. Assistant Professor" required />

          {status === 'error' && (
            <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">{errorMessage}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <Link to="/teachers" className="px-4 py-2 text-sm text-slate hover:text-ink">Cancel</Link>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-dark disabled:opacity-50"
            >
              {status === 'submitting' ? 'Saving…' : 'Save Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherForm