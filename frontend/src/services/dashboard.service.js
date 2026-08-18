import { apiGet } from './api'

const RESOURCES = [
  { key: 'subjects', label: 'Subjects', path: '/subjects', route: '/subjects' },
  { key: 'teachers', label: 'Teachers', path: '/teachers', route: '/teachers' },
  { key: 'assignments', label: 'Teacher assignments', path: '/teacher-subjects', route: null },
  { key: 'classrooms', label: 'Classrooms', path: '/classrooms', route: null },
  { key: 'timeSlots', label: 'Time slots', path: '/time-slots', route: null },
  { key: 'scheduleConfig', label: 'Schedule configs', path: '/schedule-config', route: null },
]

export async function getSetupStatus() {
  const results = await Promise.allSettled(
    RESOURCES.map((resource) => apiGet(resource.path))
  )

  return RESOURCES.map((resource, index) => {
    const result = results[index]
    const value = result.status === 'fulfilled' ? result.value : null

    return {
      ...resource,
      count: Array.isArray(value) ? value.length : null,
      failed: result.status === 'rejected',
    }
  })
}