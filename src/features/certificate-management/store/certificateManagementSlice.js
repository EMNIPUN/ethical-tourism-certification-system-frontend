import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  statusFilter: 'ALL',
  page: 1,
  limit: 10,
  selectedCertificateId: null,
  status: 'idle',
  error: null,
}

const certificateManagementSlice = createSlice({
  name: 'certificateManagement',
  initialState,
  reducers: {
    setCertificateStatusFilter(state, action) {
      state.statusFilter = action.payload || 'ALL'
      state.page = 1
    },
    setCertificateManagementPage(state, action) {
      state.page = Math.max(1, action.payload || 1)
    },
    setCertificateManagementLimit(state, action) {
      state.limit = Math.max(1, action.payload || 10)
      state.page = 1
    },
    setSelectedCertificateId(state, action) {
      state.selectedCertificateId = action.payload || null
    },
    resetCertificateManagementState() {
      return initialState
    },
  },
})

export const {
  setCertificateStatusFilter,
  setCertificateManagementPage,
  setCertificateManagementLimit,
  setSelectedCertificateId,
  resetCertificateManagementState,
} = certificateManagementSlice.actions

export default certificateManagementSlice.reducer

