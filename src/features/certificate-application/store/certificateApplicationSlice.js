import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentStep: 1,
  draft: {},
  status: 'idle',
  error: null,
}

const certificateApplicationSlice = createSlice({
  name: 'certificateApplication',
  initialState,
  reducers: {
    setApplicationStep(state, action) {
      state.currentStep = Math.max(1, action.payload || 1)
    },
    updateApplicationDraftField(state, action) {
      const { key, value } = action.payload || {}

      if (!key) {
        return
      }

      state.draft[key] = value
    },
    resetApplicationDraft() {
      return initialState
    },
  },
})

export const { setApplicationStep, updateApplicationDraftField, resetApplicationDraft } =
  certificateApplicationSlice.actions

export default certificateApplicationSlice.reducer

