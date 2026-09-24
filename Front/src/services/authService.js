import { request } from './api'

export const login = (credentials) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

export const register = (user) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user),
  })

export const getProfile = () => request('/auth/me')

export const updateProfile = (profile) =>
  request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(profile),
  })

export const searchUsers = (query) =>
  request(`/auth/users/search?q=${encodeURIComponent(query)}`)
