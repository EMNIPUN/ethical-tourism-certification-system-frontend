import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { auditApi } from '../api/auditApi'

export const fetchAudits = createAsyncThunk(
  'audit/fetchAudits',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      const response = await auditApi.getAllAudits(params, token)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchAuditById = createAsyncThunk(
  'audit/fetchAuditById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const token = auth.token
      const response = await auditApi.getAuditById(id, token)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  items: [],
  selectedAudit: null,
  selectedAuditId: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  filter: 'all',
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setAuditFilter(state, action) {
      state.filter = action.payload || 'all'
      state.pagination.page = 1
    },
    setAuditPage(state, action) {
      state.pagination.page = Math.max(1, action.payload || 1)
    },
    setAuditLimit(state, action) {
      state.pagination.limit = Math.max(1, action.payload || 10)
      state.pagination.page = 1
    },
    setSelectedAuditId(state, action) {
      state.selectedAuditId = action.payload || null
    },
    clearSelectedAudit(state) {
      state.selectedAudit = null
      state.selectedAuditId = null
    },
    resetAuditState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudits.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAudits.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAudits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchAuditById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAuditById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.selectedAudit = action.payload.data
      })
      .addCase(fetchAuditById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const {
  setAuditFilter,
  setAuditLimit,
  setAuditPage,
  setSelectedAuditId,
  clearSelectedAudit,
  resetAuditState,
} = auditSlice.actions

export default auditSlice.reducer

