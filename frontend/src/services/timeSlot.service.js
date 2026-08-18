import { apiGet, apiPost, apiPatch, apiDelete } from './api'

export function getTimeSlots() {
  return apiGet('/time-slots')
}

export function createTimeSlot(data) {
  return apiPost('/time-slots', data)
}

export function updateTimeSlot(id, data) {
  return apiPatch(`/time-slots/${id}`, data)
}

export function deleteTimeSlot(id) {
  return apiDelete(`/time-slots/${id}`)
}