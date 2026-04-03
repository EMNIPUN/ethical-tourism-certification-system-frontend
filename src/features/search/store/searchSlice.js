import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  query: '',
  filters: {},
  sortBy: 'relevance',
  page: 1,
  limit: 10,
  results: [],
  total: 0,
  status: 'idle',
  error: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.query = action.payload
      state.page = 1
    },
    setSearchFilters(state, action) {
      state.filters = action.payload || {}
      state.page = 1
    },
    setSearchSortBy(state, action) {
      state.sortBy = action.payload
      state.page = 1
    },
    setSearchPage(state, action) {
      state.page = Math.max(1, action.payload || 1)
    },
    setSearchLimit(state, action) {
      state.limit = Math.max(1, action.payload || 10)
      state.page = 1
    },
    resetSearchState() {
      return initialState
    },
  },
})

export const {
  setSearchFilters,
  setSearchLimit,
  setSearchPage,
  setSearchQuery,
  setSearchSortBy,
  resetSearchState,
} = searchSlice.actions

export default searchSlice.reducer

