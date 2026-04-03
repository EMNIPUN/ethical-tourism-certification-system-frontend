import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { clearAuthError, login, logout, register } from '../store/authSlice'
import {
  selectAuthError,
  selectAuthStatus,
  selectAuthToken,
  selectAuthUser,
  selectIsAuthenticated,
  selectIsAuthInitializing,
} from '../store/authSelectors'

function resolveThunkError(actionResult, fallbackMessage) {
  if (typeof actionResult?.payload === 'string') {
    return actionResult.payload
  }

  return actionResult?.error?.message || fallbackMessage
}

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAuthToken)
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)
  const isInitializing = useAppSelector(selectIsAuthInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const loginUser = useCallback(
    async (email, password) => {
      const result = await dispatch(login({ email, password }))

      if (login.fulfilled.match(result)) {
        return {
          ...result.payload.response,
          token: result.payload.token,
          user: result.payload.user,
        }
      }

      throw new Error(resolveThunkError(result, 'Login failed. Please try again.'))
    },
    [dispatch],
  )

  const registerUser = useCallback(
    async (payload) => {
      const result = await dispatch(register(payload))

      if (register.fulfilled.match(result)) {
        return result.payload.response
      }

      throw new Error(resolveThunkError(result, 'Registration failed. Please try again.'))
    },
    [dispatch],
  )

  const logoutUser = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  return {
    user,
    token,
    status,
    error,
    isInitializing,
    isAuthenticated,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    clearError,
  }
}
