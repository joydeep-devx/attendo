const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  })

  const result = await response.json()

  if (!response.ok) {
    const error = new Error(result.message || 'Request failed')
    error.status = response.status
    throw error
  }

  return result
}

export function apiGet(path) {
  return request(path).then((result) => result.data)
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.data)
}

export function apiPatch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) }).then((r) => r.data)
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}