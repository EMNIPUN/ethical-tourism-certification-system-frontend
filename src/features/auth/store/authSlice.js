import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/authService'

function extractErrorMessage(error, fallbackMessage) {
  return error?.data?.error || error?.data?.message || error?.message || fallbackMessage
}

const initialState = {
  token: getStoredToken(),
  user: null,
  isInitializing: true,
  status: 'idle',
  error: null,
}

export const bootstrapAuthSession = createAsyncThunk(
  'auth/bootstrapAuthSession',
  async (_, { rejectWithValue }) => {
    const token = getStoredToken()

    if (!token) {
      return {
        token: null,
        user: null,
      }
    }

    try {
      const meResponse = await getCurrentUser(token)

      return {
        token,
        user: meResponse?.data || null,
      }
    } catch (error) {
      clearStoredToken()
      return rejectWithValue(extractErrorMessage(error, 'Session expired. Please sign in again.'))
    }
  },
)

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await loginUser(credentials)
    const token = response?.token || getStoredToken()

    if (!token) {
      throw new Error('Login succeeded but no token was returned.')
    }

    const meResponse = await getCurrentUser(token)

    return {
      token,
      user: meResponse?.data || response?.data || null,
      response,
    }
  } catch (error) {
    clearStoredToken()
    return rejectWithValue(extractErrorMessage(error, 'Login failed. Please try again.'))
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await registerUser(payload)
    clearStoredToken()

    return {
      token: null,
      user: null,
      response,
    }
  } catch (error) {
    clearStoredToken()
    return rejectWithValue(extractErrorMessage(error, 'Registration failed. Please try again.'))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      logoutUser()
      state.token = null
      state.user = null
      state.error = null
      state.status = 'idle'
      state.isInitializing = false
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuthSession.pending, (state) => {
        state.isInitializing = true
        state.error = null
      })
      .addCase(bootstrapAuthSession.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.isInitializing = false
        state.status = 'idle'
      })
      .addCase(bootstrapAuthSession.rejected, (state, action) => {
        state.token = null
        state.user = null
        state.isInitializing = false
        state.status = 'idle'
        state.error = action.payload || 'Session initialization failed.'
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.status = 'succeeded'
        state.isInitializing = false
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null
        state.user = null
        state.status = 'failed'
        state.error = action.payload || 'Login failed.'
        state.isInitializing = false
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.user = action.payload.user
        state.status = 'succeeded'
        state.isInitializing = false
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null
        state.user = null
        state.status = 'failed'
        state.error = action.payload || 'Registration failed.'
        state.isInitializing = false
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
