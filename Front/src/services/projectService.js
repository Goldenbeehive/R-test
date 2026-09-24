import { request } from './api'

export const getProjects = () => request('/projects')

export const createProject = (project) =>
  request('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })

export const getMembers = (projectId) =>
  request(`/projects/${projectId}/members`)

export const updateProject = (projectId, project) =>
  request(`/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(project),
  })

export const deleteProject = (projectId) =>
  request(`/projects/${projectId}`, { method: 'DELETE' })

export const addMember = (projectId, userId) =>
  request(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  })

export const removeMember = (projectId, userId) =>
  request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
