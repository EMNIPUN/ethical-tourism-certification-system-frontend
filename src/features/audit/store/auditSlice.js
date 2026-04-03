import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  selectedAuditId: null,
  filter: 'all',
  page: 1,
  limit: 10,
  status: 'idle',
  error: null,
}

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setAuditFilter(state, action) {
      state.filter = action.payload || 'all'
      state.page = 1
    },
    setAuditPage(state, action) {
      state.page = Math.max(1, action.payload || 1)
    },
    setAuditLimit(state, action) {
      state.limit = Math.max(1, action.payload || 10)
      state.page = 1
    },
    setSelectedAuditId(state, action) {
      state.selectedAuditId = action.payload || null
    },
    resetAuditState() {
      return initialState
    },
  },
})

export const {
  setAuditFilter,
  setAuditLimit,
  setAuditPage,
  setSelectedAuditId,
  resetAuditState,
} = auditSlice.actions

export default auditSlice.reducer

