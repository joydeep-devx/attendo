import { apiGet, apiPost } from './api'

export function getSubjects() {
  return apiGet('/subjects')
}

export function createSubject(subjectData) {
  return apiPost('/subjects', subjectData)
}