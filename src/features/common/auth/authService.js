import { apiRequest } from '../../../services/apiClient'

const TOKEN_STORAGE_KEY = 'etcs_auth_token'

export const AUTH_ROLES = ['Admin', 'Hotel Owner', 'Auditor', 'Tourist']

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

function setStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export async function registerUser(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  })

  if (data?.token) {
    setStoredToken(data.token)
  }

  return data
}

export async function loginUser(payload) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: payload,
  })

  if (data?.token) {
    setStoredToken(data.token)
  }

  return data
}

export async function getCurrentUser() {
  const token = getStoredToken()

  if (!token) {
    throw new Error('No authentication token found')
  }

  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  })
}

export function logoutUser() {
  clearStoredToken()
}
