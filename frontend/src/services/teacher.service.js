const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function getTeachers() {
  const response = await fetch(`${API_BASE_URL}/teachers`)
  if (!response.ok) throw new Error('Failed to fetch teachers')
  const result = await response.json()
  return result.data
}