const API_URL = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem('curt_token')

export const request = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed')
    error.status = response.status
    throw error
  }

  return data
}
