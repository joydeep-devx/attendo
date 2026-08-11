const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getSubjects() {
  const response = await fetch(`${API_BASE_URL}/subjects`)
  if (!response.ok) throw new Error('Failed to fetch subjects')
  const result = await response.json()
  return result.data
}