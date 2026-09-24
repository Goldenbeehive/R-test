import { request } from './api'

export const getTasks = (projectId) =>
  request(`/tasks?project_id=${encodeURIComponent(projectId)}`)

export const createTask = (task) =>
  request('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })

export const updateTaskStatus = (taskId, status) =>
  request(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const assignTask = (taskId, assigned_to) =>
  request(`/tasks/${taskId}/assignee`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to }),
  })

export const updateTask = (taskId, task) =>
  request(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(task),
  })

export const deleteTask = (taskId) =>
  request(`/tasks/${taskId}`, { method: 'DELETE' })
