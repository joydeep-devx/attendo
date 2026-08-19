import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClassrooms, deleteClassroom } from '../../services/classroom.service'

function Classrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setClassrooms(await getClassrooms())
        setStatus('success')
      } catch (error) {
        setErrorMessage(error.message)
        setStatus('error')
      }
    }
    load()
  }, [])

  async function handleDelete(classroom) {
    const confirmed = window.confirm(`Delete ${classroom.name}? This cannot be undone.`)
    if (!confirmed) return

    setDeletingId(classroom._id)
    try {
      await deleteClassroom(classroom._id)
      setClassrooms((prev) => prev.filter((c) => c._id !== classroom._id))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  function renderContent() {
    if (status === 'loading') {
      return <p className="text-slate">Loading classrooms…</p>
    }

    if (status === 'error') {
      return <p className="rounded-md bg-absent-soft px-4 py-3 text-absent">{errorMessage}</p>
    }

    if (classrooms.length === 0) {
      return (
        <div className="rounded-lg border border-line bg-paper-raised px-6 py-12 text-center">
          <p className="text-slate">No classrooms yet.</p>
        </div>
      )
    }

    return (
      <div className="overflow-hidden rounded-lg border border-line bg-paper-raised">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {['Name', 'Room Type', 'Capacity'].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left font-mono text-xs font-normal uppercase tracking-wide text-slate"
                >
                  {heading}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {classrooms.map((classroom) => (
              <tr key={classroom._id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3 text-ink">{classroom.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-indigo-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-indigo">
                    {classroom.roomType}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate">{classroom.capacity}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/classrooms/${classroom._id}/edit`}
                    className="mr-4 text-sm text-slate hover:text-indigo"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(classroom)}
                    disabled={deletingId === classroom._id}
                    className="text-sm text-slate hover:text-absent disabled:opacity-50"
                  >
                    {deletingId === classroom._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Classrooms</h1>
        <Link
          to="/classrooms/new"
          className="rounded-md bg-indigo px-4 py-2 text-sm text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
        >
          Add Classroom
        </Link>
      </div>
      {renderContent()}
    </div>
  )
}

export default Classrooms