const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getTeachers() {
  const response = await fetch(`${API_BASE_URL}/teachers`)
  if (!response.ok) throw new Error('Failed to fetch teachers')
  const result = await response.json()
  return result.data
}

export async function createTeacher(teacherData) {
  const response = await fetch(`${API_BASE_URL}/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacherData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create teacher')
  }

  return result.data
}

export async function deleteTeacher(id) {
  const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete teacher')
  }
}

export async function getTeacher(id) {
  const response = await fetch(`${API_BASE_URL}/teachers`)
  if (!response.ok) throw new Error('Failed to fetch teacher')
  const result = await response.json()

  const teacher = result.data.find((t) => t._id === id)
  if (!teacher) throw new Error('Teacher not found')

  return teacher
}

export async function updateTeacher(id, teacherData) {
  const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacherData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update teacher')
  }

  return result.data
}