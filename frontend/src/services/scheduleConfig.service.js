import { apiGet, apiPost, apiPatch } from './api'

export function getScheduleConfigs() {
  return apiGet('/schedule-config')
}

export async function getScheduleConfig(id) {
  const configs = await apiGet('/schedule-config')
  const config = configs.find((c) => c._id === id)
  if (!config) throw new Error('Schedule configuration not found')
  return config
}

export function createScheduleConfig(data) {
  return apiPost('/schedule-config', data)
}

export function updateScheduleConfig(id, data) {
  return apiPatch(`/schedule-config/${id}`, data)
}