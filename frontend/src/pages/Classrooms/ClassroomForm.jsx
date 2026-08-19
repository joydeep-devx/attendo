import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Field from '../../components/Field'
import {
  createClassroom,
  getClassroom,
  updateClassroom,
} from '../../services/classroom.service'

const initialFormState = {
  name: '',
  roomType: '',
  capacity: '',
}

function ClassroomForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormState)
  const [status, setStatus] = useState(isEditMode ? 'loading' : 'idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    async function load() {
      try {
        const classroom = await getClassroom(id)
        setFormData({
          name: classroom.name,
          roomType: classroom.roomType,
          capacity: String(classroom.capacity),
        })
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

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const payload = {
      name: formData.name,
      roomType: formData.roomType,
      capacity: Number(formData.capacity),
    }

    try {
      if (isEditMode) {
        await updateClassroom(id, payload)
      } else {
        await createClassroom(payload)
      }
      navigate('/classrooms')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('idle')
    }
  }

  if (status === 'loading') {
    return <p className="text-slate">Loading classroom…</p>
  }

  return (
    <div className="max-w-xl">
      <Link
        to="/classrooms"
        className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo"
      >
        ← Back to Classrooms
      </Link>

      <h1 className="mt-2 mb-6 font-display text-2xl text-ink">
        {isEditMode ? 'Edit Classroom' : 'Add Classroom'}
      </h1>

      <div className="rounded-lg border border-line bg-paper-raised p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Room 301"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Room Type"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              placeholder="e.g. CLASSROOM"
              required
            />
            <Field
              label="Capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 60"
              required
            />
          </div>

          {errorMessage && (
            <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <Link to="/classrooms" className="px-4 py-2 text-sm text-slate hover:text-ink">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {status === 'submitting' ? 'Saving…' : 'Save Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassroomForm