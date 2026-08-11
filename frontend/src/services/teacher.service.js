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