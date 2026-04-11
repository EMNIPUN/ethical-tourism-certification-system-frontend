import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  confirmHotelMatch,
  createHotelApplication,
  deleteHotelById,
  getHotelById,
  listHotels,
  listOwnerCertificates,
  updateHotelApplication,
} from '../api/certificateApplicationApi'

function extractErrorMessage(error, fallbackMessage) {
  return error?.data?.error || error?.data?.message || error?.message || fallbackMessage
}

function requireAuthToken(getState) {
  const token = getState()?.auth?.token

  if (!token) {
    throw new Error('Authentication required')
  }

  return token
}

function setDraftValue(target, path, value) {
  if (!path) {
    return
  }

  const segments = String(path).split('.').filter(Boolean)
  if (!segments.length) {
    return
  }

  let cursor = target
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    if (!cursor[segment] || typeof cursor[segment] !== 'object') {
      cursor[segment] = {}
    }
    cursor = cursor[segment]
  }

  cursor[segments[segments.length - 1]] = value
}

export const fetchHotels = createAsyncThunk(
  'certificateApplication/fetchHotels',
  async ({ page = 1, limit = 10, sort, fields, filters } = {}, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await listHotels({ page, limit, sort, fields, filters }, token)

      return {
        items: response?.data || [],
        count: response?.count || 0,
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load applications'))
    }
  },
)

export const fetchHotel = createAsyncThunk(
  'certificateApplication/fetchHotel',
  async (hotelId, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await getHotelById(hotelId, token)
      return response?.data || null
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load application details'))
    }
  },
)

export const fetchOwnerCertificates = createAsyncThunk(
  'certificateApplication/fetchOwnerCertificates',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await listOwnerCertificates(token)
      const list = Array.isArray(response?.data) ? response.data : []
      return list
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load certificates'))
    }
  },
)

export const submitNewHotel = createAsyncThunk(
  'certificateApplication/submitNewHotel',
  async ({ hotelData, files }, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await createHotelApplication({ hotelData, files }, token)
      return {
        hotelId: response?.data?.hotelId || null,
        candidates: response?.data?.candidates || [],
        message: response?.message || '',
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to submit application'))
    }
  },
)

export const submitConfirmMatch = createAsyncThunk(
  'certificateApplication/submitConfirmMatch',
  async ({ hotelId, placeId, thumbnail }, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await confirmHotelMatch(hotelId, placeId, token, thumbnail)
      return {
        evaluation: response?.evaluation || null,
        hotel: response?.data?.hotel || null,
        hotelRequest: response?.data?.hotelRequest || null,
        message: response?.message || '',
      }
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to confirm match'))
    }
  },
)

export const submitHotelUpdate = createAsyncThunk(
  'certificateApplication/submitHotelUpdate',
  async ({ hotelId, hotelData, files }, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      const response = await updateHotelApplication(hotelId, { hotelData, files }, token)
      return response?.data || null
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update application'))
    }
  },
)

export const submitHotelDelete = createAsyncThunk(
  'certificateApplication/submitHotelDelete',
  async ({ hotelId }, { getState, rejectWithValue }) => {
    try {
      const token = requireAuthToken(getState)
      await deleteHotelById(hotelId, token)
      return hotelId
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete application'))
    }
  },
)

const initialState = {
  currentStep: 1,
  draft: {},
  hotels: {
    items: [],
    count: 0,
    status: 'idle',
    error: null,
    // Stores the last query used to fetch — used to skip re-fetching on navigation back
    query: { page: 1, sort: '-createdAt', search: '', typeFilter: '', certFilter: '' },
  },
  hotelDetails: {
    data: null,
    status: 'idle',
    error: null,
  },
  ownerCertificates: {
    items: [],
    status: 'idle',
    error: null,
  },
  create: {
    status: 'idle',
    error: null,
    result: null,
  },
  confirm: {
    status: 'idle',
    error: null,
    result: null,
  },
  update: {
    status: 'idle',
    error: null,
  },
  delete: {
    status: 'idle',
    error: null,
  },
}

const certificateApplicationSlice = createSlice({
  name: 'certificateApplication',
  initialState,
  reducers: {
    setApplicationStep(state, action) {
      state.currentStep = Math.max(1, action.payload || 1)
    },
    updateApplicationDraftField(state, action) {
      const { key, path, value } = action.payload || {}

      const resolvedPath = path || key

      if (!resolvedPath) {
        return
      }

      if (!state.draft || typeof state.draft !== 'object') {
        state.draft = {}
      }

      setDraftValue(state.draft, resolvedPath, value)
    },
    setApplicationDraft(state, action) {
      state.draft = action.payload || {}
    },
    resetApplicationDraft() {
      return initialState
    },
    // Persist list query state so the list page restores its position on navigation back
    setHotelsQuery(state, action) {
      state.hotels.query = { ...state.hotels.query, ...action.payload }
    },
    // Force a refresh next time the list mounts (e.g., after create/delete)
    invalidateHotelsList(state) {
      state.hotels.status = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.hotels.status = 'loading'
        state.hotels.error = null
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.hotels.status = 'succeeded'
        state.hotels.items = action.payload.items
        state.hotels.count = action.payload.count
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.hotels.status = 'failed'
        state.hotels.error = action.payload || 'Failed to load applications'
      })
      .addCase(fetchHotel.pending, (state) => {
        state.hotelDetails.status = 'loading'
        state.hotelDetails.error = null
      })
      .addCase(fetchHotel.fulfilled, (state, action) => {
        state.hotelDetails.status = 'succeeded'
        state.hotelDetails.data = action.payload
      })
      .addCase(fetchHotel.rejected, (state, action) => {
        state.hotelDetails.status = 'failed'
        state.hotelDetails.error = action.payload || 'Failed to load application details'
      })
      .addCase(fetchOwnerCertificates.pending, (state) => {
        state.ownerCertificates.status = 'loading'
        state.ownerCertificates.error = null
      })
      .addCase(fetchOwnerCertificates.fulfilled, (state, action) => {
        state.ownerCertificates.status = 'succeeded'
        state.ownerCertificates.items = action.payload
      })
      .addCase(fetchOwnerCertificates.rejected, (state, action) => {
        state.ownerCertificates.status = 'failed'
        state.ownerCertificates.error = action.payload || 'Failed to load certificates'
      })
      .addCase(submitNewHotel.pending, (state) => {
        state.create.status = 'loading'
        state.create.error = null
        state.create.result = null
      })
      .addCase(submitNewHotel.fulfilled, (state, action) => {
        state.create.status = 'succeeded'
        state.create.result = action.payload
      })
      .addCase(submitNewHotel.rejected, (state, action) => {
        state.create.status = 'failed'
        state.create.error = action.payload || 'Failed to submit application'
      })
      .addCase(submitConfirmMatch.pending, (state) => {
        state.confirm.status = 'loading'
        state.confirm.error = null
        state.confirm.result = null
      })
      .addCase(submitConfirmMatch.fulfilled, (state, action) => {
        state.confirm.status = 'succeeded'
        state.confirm.result = action.payload
        if (action.payload.hotel) {
          state.hotelDetails.data = action.payload.hotel
        }
      })
      .addCase(submitConfirmMatch.rejected, (state, action) => {
        state.confirm.status = 'failed'
        state.confirm.error = action.payload || 'Failed to confirm match'
      })
      .addCase(submitHotelUpdate.pending, (state) => {
        state.update.status = 'loading'
        state.update.error = null
      })
      .addCase(submitHotelUpdate.fulfilled, (state, action) => {
        state.update.status = 'succeeded'
        state.hotelDetails.data = action.payload
      })
      .addCase(submitHotelUpdate.rejected, (state, action) => {
        state.update.status = 'failed'
        state.update.error = action.payload || 'Failed to update application'
      })
      .addCase(submitHotelDelete.pending, (state) => {
        state.delete.status = 'loading'
        state.delete.error = null
      })
      .addCase(submitHotelDelete.fulfilled, (state, action) => {
        state.delete.status = 'succeeded'
        state.hotels.items  = state.hotels.items.filter((item) => item?._id !== action.payload)
        state.hotels.status = 'idle'   // force re-fetch next time the list mounts
        if (state.hotelDetails.data?._id === action.payload) {
          state.hotelDetails.data = null
        }
      })
      .addCase(submitHotelDelete.rejected, (state, action) => {
        state.delete.status = 'failed'
        state.delete.error = action.payload || 'Failed to delete application'
      })
  },
})

export const { setApplicationStep, updateApplicationDraftField, resetApplicationDraft } =
  certificateApplicationSlice.actions

export const { setApplicationDraft, setHotelsQuery, invalidateHotelsList } =
  certificateApplicationSlice.actions

export default certificateApplicationSlice.reducer

