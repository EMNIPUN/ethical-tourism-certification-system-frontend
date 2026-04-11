import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createHotelFeedback,
  deleteHotelFeedback,
  fetchAIHotelRecommendations,
  fetchAllHotelContacts,
  fetchHotelContactById,
  fetchHotelFeedbackById,
  searchHotelContactsByLocation,
  updateHotelFeedback,
} from '../api/searchApi'
import { selectAuthToken } from '../../auth/store/authSelectors'

const initialState = {
  query: '',
  activeTab: 'discover',
  contacts: [],
  contactsStatus: 'idle',
  contactsError: null,
  selectedHotelId: null,
  selectedHotel: null,
  selectedHotelStatus: 'idle',
  selectedHotelError: null,
  selectedFeedback: null,
  feedbackStatus: 'idle',
  feedbackError: null,
  feedbackMutationStatus: 'idle',
  feedbackMutationError: null,
  recommendations: null,
  recommendationsStatus: 'idle',
  recommendationsError: null,
}

function getRequestToken(getState) {
  return selectAuthToken(getState())
}

function extractApiErrorMessage(error, fallbackMessage) {
  return error?.data?.error || error?.data?.message || error?.message || fallbackMessage
}

export const loadHotelContacts = createAsyncThunk(
  'search/loadHotelContacts',
  async (_, { getState, rejectWithValue }) => {
    try {
      return await fetchAllHotelContacts(getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load hotel contacts.'))
    }
  },
)

export const searchHotels = createAsyncThunk(
  'search/searchHotels',
  async (location, { getState, rejectWithValue }) => {
    try {
      return await searchHotelContactsByLocation(location, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to search hotels by location.'))
    }
  },
)

export const loadSelectedHotel = createAsyncThunk(
  'search/loadSelectedHotel',
  async (hotelId, { getState, rejectWithValue }) => {
    try {
      return await fetchHotelContactById(hotelId, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load hotel details.'))
    }
  },
)

export const loadSelectedHotelFeedback = createAsyncThunk(
  'search/loadSelectedHotelFeedback',
  async (hotelId, { getState, rejectWithValue }) => {
    try {
      return await fetchHotelFeedbackById(hotelId, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load hotel feedback.'))
    }
  },
)

export const loadHotelRecommendations = createAsyncThunk(
  'search/loadHotelRecommendations',
  async (_, { getState, rejectWithValue }) => {
    try {
      return await fetchAIHotelRecommendations(getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load hotel recommendations.'))
    }
  },
)

export const addHotelFeedback = createAsyncThunk(
  'search/addHotelFeedback',
  async ({ hotelId, rating, feedback }, { getState, rejectWithValue }) => {
    try {
      return await createHotelFeedback(hotelId, { rating, feedback }, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to submit feedback.'))
    }
  },
)

export const editHotelFeedback = createAsyncThunk(
  'search/editHotelFeedback',
  async ({ hotelId, feedbackId, rating, feedback }, { getState, rejectWithValue }) => {
    try {
      return await updateHotelFeedback(hotelId, feedbackId, { rating, feedback }, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to update feedback.'))
    }
  },
)

export const removeHotelFeedback = createAsyncThunk(
  'search/removeHotelFeedback',
  async ({ hotelId, feedbackId }, { getState, rejectWithValue }) => {
    try {
      return await deleteHotelFeedback(hotelId, feedbackId, getRequestToken(getState))
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to delete feedback.'))
    }
  },
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.query = action.payload
    },
    setSearchActiveTab(state, action) {
      state.activeTab = action.payload || 'discover'
    },
    setSelectedHotelId(state, action) {
      state.selectedHotelId = action.payload || null
    },
    clearSelectedHotel(state) {
      state.selectedHotelId = null
      state.selectedHotel = null
      state.selectedFeedback = null
      state.selectedHotelStatus = 'idle'
      state.selectedHotelError = null
      state.feedbackStatus = 'idle'
      state.feedbackError = null
      state.feedbackMutationStatus = 'idle'
      state.feedbackMutationError = null
    },
    clearFeedbackMutationState(state) {
      state.feedbackMutationStatus = 'idle'
      state.feedbackMutationError = null
    },
    resetSearchState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHotelContacts.pending, (state) => {
        state.contactsStatus = 'loading'
        state.contactsError = null
      })
      .addCase(loadHotelContacts.fulfilled, (state, action) => {
        state.contactsStatus = 'succeeded'
        state.contacts = action.payload?.data || []
        state.contactsError = null
      })
      .addCase(loadHotelContacts.rejected, (state, action) => {
        state.contactsStatus = 'failed'
        state.contactsError = action.payload || 'Failed to load hotel contacts.'
      })
      .addCase(searchHotels.pending, (state) => {
        state.contactsStatus = 'loading'
        state.contactsError = null
      })
      .addCase(searchHotels.fulfilled, (state, action) => {
        state.contactsStatus = 'succeeded'
        state.contacts = action.payload?.data || []
        state.query = action.meta.arg || ''
        state.contactsError = null
      })
      .addCase(searchHotels.rejected, (state, action) => {
        state.contactsStatus = 'failed'
        state.contactsError = action.payload || 'Failed to search hotels by location.'
      })
      .addCase(loadSelectedHotel.pending, (state) => {
        state.selectedHotelStatus = 'loading'
        state.selectedHotelError = null
      })
      .addCase(loadSelectedHotel.fulfilled, (state, action) => {
        state.selectedHotelStatus = 'succeeded'
        state.selectedHotel = action.payload?.data || null
        state.selectedHotelError = null
      })
      .addCase(loadSelectedHotel.rejected, (state, action) => {
        state.selectedHotelStatus = 'failed'
        state.selectedHotelError = action.payload || 'Failed to load hotel details.'
      })
      .addCase(loadSelectedHotelFeedback.pending, (state) => {
        state.feedbackStatus = 'loading'
        state.feedbackError = null
      })
      .addCase(loadSelectedHotelFeedback.fulfilled, (state, action) => {
        state.feedbackStatus = 'succeeded'
        state.selectedFeedback = action.payload?.data || null
        state.feedbackError = null
      })
      .addCase(loadSelectedHotelFeedback.rejected, (state, action) => {
        state.feedbackStatus = 'failed'
        state.feedbackError = action.payload || 'Failed to load hotel feedback.'
      })
      .addCase(loadHotelRecommendations.pending, (state) => {
        state.recommendationsStatus = 'loading'
        state.recommendationsError = null
      })
      .addCase(loadHotelRecommendations.fulfilled, (state, action) => {
        state.recommendationsStatus = 'succeeded'
        state.recommendations = action.payload?.data || null
        state.recommendationsError = null
      })
      .addCase(loadHotelRecommendations.rejected, (state, action) => {
        state.recommendationsStatus = 'failed'
        state.recommendationsError = action.payload || 'Failed to load hotel recommendations.'
      })
      .addCase(addHotelFeedback.pending, (state) => {
        state.feedbackMutationStatus = 'loading'
        state.feedbackMutationError = null
      })
      .addCase(addHotelFeedback.fulfilled, (state) => {
        state.feedbackMutationStatus = 'succeeded'
        state.feedbackMutationError = null
      })
      .addCase(addHotelFeedback.rejected, (state, action) => {
        state.feedbackMutationStatus = 'failed'
        state.feedbackMutationError = action.payload || 'Failed to submit feedback.'
      })
      .addCase(editHotelFeedback.pending, (state) => {
        state.feedbackMutationStatus = 'loading'
        state.feedbackMutationError = null
      })
      .addCase(editHotelFeedback.fulfilled, (state) => {
        state.feedbackMutationStatus = 'succeeded'
        state.feedbackMutationError = null
      })
      .addCase(editHotelFeedback.rejected, (state, action) => {
        state.feedbackMutationStatus = 'failed'
        state.feedbackMutationError = action.payload || 'Failed to update feedback.'
      })
      .addCase(removeHotelFeedback.pending, (state) => {
        state.feedbackMutationStatus = 'loading'
        state.feedbackMutationError = null
      })
      .addCase(removeHotelFeedback.fulfilled, (state) => {
        state.feedbackMutationStatus = 'succeeded'
        state.feedbackMutationError = null
      })
      .addCase(removeHotelFeedback.rejected, (state, action) => {
        state.feedbackMutationStatus = 'failed'
        state.feedbackMutationError = action.payload || 'Failed to delete feedback.'
      })
  },
})

export const {
  setSearchQuery,
  setSearchActiveTab,
  setSelectedHotelId,
  clearSelectedHotel,
  clearFeedbackMutationState,
  resetSearchState,
} = searchSlice.actions

export default searchSlice.reducer

