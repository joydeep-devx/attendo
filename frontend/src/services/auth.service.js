import { apiGet, apiPost } from './api'

export function login(username, password) {
  return apiPost('/auth/login', { username, password })
}

export function loginFace(embedding, threshold) {
  return apiPost('/auth/login-face', { embedding, threshold })
}

export function register(payload) {
  return apiPost('/auth/register', payload)
}

export function registerFace(payload) {
  return apiPost('/auth/register-face', payload)
}

export function logout() {
  return apiPost('/auth/logout')
}

export function getCurrentUser() {
  return apiGet('/auth/me')
}