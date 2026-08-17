const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getSubjects() {
  const response = await fetch(`${API_BASE_URL}/subjects`)
  if (!response.ok) throw new Error('Failed to fetch subjects')
  const result = await response.json()
  return result.data
}

export async function createSubject(subjectData) {
  const response = await fetch(`${API_BASE_URL}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subjectData),
  })

  if (response.status === 409) {
    throw new Error('A subject with this code already exists.')
  }
  if (!response.ok) throw new Error('Failed to create subject')

  const result = await response.json()
  return result.data
}