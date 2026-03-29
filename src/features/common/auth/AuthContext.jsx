import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  loginUser,
  logoutUser,
  registerUser,
} from './authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    const meResponse = await getCurrentUser()
    setUser(meResponse?.data || null)
    return meResponse?.data || null
  }, [])

  useEffect(() => {
    let ignore = false

    async function bootstrapSession() {
      const existingToken = getStoredToken()

      if (!existingToken) {
        if (!ignore) {
          setToken(null)
          setUser(null)
          setIsInitializing(false)
        }
        return
      }

      try {
        if (!ignore) {
          setToken(existingToken)
        }
        const meResponse = await getCurrentUser()

        if (!ignore) {
          setUser(meResponse?.data || null)
        }
      } catch {
        clearStoredToken()
        if (!ignore) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!ignore) {
          setIsInitializing(false)
        }
      }
    }

    bootstrapSession()

    return () => {
      ignore = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await loginUser({ email, password })
    const nextToken = response?.token || getStoredToken()

    setToken(nextToken)
    const currentUser = await loadCurrentUser()

    return {
      ...response,
      user: currentUser,
    }
  }, [loadCurrentUser])

  const register = useCallback(async ({ name, email, password, role }) => {
    const response = await registerUser({ name, email, password, role })
    const nextToken = response?.token || getStoredToken()

    setToken(nextToken)
    const currentUser = await loadCurrentUser()

    return {
      ...response,
      user: currentUser,
    }
  }, [loadCurrentUser])

  const logout = useCallback(() => {
    logoutUser()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, isInitializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
