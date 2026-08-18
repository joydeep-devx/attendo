import { apiGet, apiPost, apiPatch, apiDelete } from './api'

export function getTeachers() {
  return apiGet('/teachers')
}

export async function getTeacher(id) {
  const teachers = await apiGet('/teachers')
  const teacher = teachers.find((t) => t._id === id)
  if (!teacher) throw new Error('Teacher not found')
  return teacher
}

export function createTeacher(teacherData) {
  return apiPost('/teachers', teacherData)
}

export function updateTeacher(id, teacherData) {
  return apiPatch(`/teachers/${id}`, teacherData)
}

export function deleteTeacher(id) {
  return apiDelete(`/teachers/${id}`)
}