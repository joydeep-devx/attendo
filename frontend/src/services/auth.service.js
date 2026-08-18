import { apiGet, apiPost } from './api'

export function login(username, password) {
  return apiPost('/auth/login', { username, password })
}

export function register(payload) {
  return apiPost('/auth/register', payload)
}

export function logout() {
  return apiPost('/auth/logout')
}

export function getCurrentUser() {
  return apiGet('/auth/me')
}