import { apiGet, apiPost, apiPatch, apiDelete } from './api'

export function getClassrooms() {
  return apiGet('/classrooms')
}

export async function getClassroom(id) {
  const classrooms = await apiGet('/classrooms')
  const classroom = classrooms.find((c) => c._id === id)
  if (!classroom) throw new Error('Classroom not found')
  return classroom
}

export function createClassroom(data) {
  return apiPost('/classrooms', data)
}

export function updateClassroom(id, data) {
  return apiPatch(`/classrooms/${id}`, data)
}

export function deleteClassroom(id) {
  return apiDelete(`/classrooms/${id}`)
}