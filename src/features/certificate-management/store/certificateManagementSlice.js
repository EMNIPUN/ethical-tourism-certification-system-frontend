import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  deleteCertificatePermanently,
  getCertificateDetails,
  getCertificateOverviewCharts,
  getCertificateOverviewStats,
  getCertificateTimeline,
  getCertificates,
  getEligibleHotels,
  getIssuanceHubData,
  issueCertificate,
  renewCertificate,
  revokeCertificate,
  updateCertificateDetails,
  updateTrustScore,
} from '../api/certificateManagementApi'

function resolveThunkError(error, fallbackMessage) {
  return error?.message || fallbackMessage
}

export const fetchCertificates = createAsyncThunk(
  'certificateManagement/fetchCertificates',
  async (statusFilter = '', { rejectWithValue }) => {
    try {
      const response = await getCertificates(statusFilter)
      return response?.data || []
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load certificates'))
    }
  },
)

export const fetchEligibleHotels = createAsyncThunk(
  'certificateManagement/fetchEligibleHotels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEligibleHotels()
      return response?.data || []
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load eligible hotels'))
    }
  },
)

export const fetchIssuanceHubData = createAsyncThunk(
  'certificateManagement/fetchIssuanceHubData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getIssuanceHubData()
      return {
        summary: response?.summary || {},
        data: response?.data || [],
      }
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load issuance hub data'))
    }
  },
)

export const fetchCertificateOverviewStats = createAsyncThunk(
  'certificateManagement/fetchCertificateOverviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCertificateOverviewStats()
      return response?.data || {}
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load certificate overview stats'))
    }
  },
)

export const fetchCertificateOverviewCharts = createAsyncThunk(
  'certificateManagement/fetchCertificateOverviewCharts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCertificateOverviewCharts()
      return {
        statusDistribution: response?.data?.statusDistribution || [],
        levelDistribution: response?.data?.levelDistribution || [],
        monthlyIssuedTrend: response?.data?.monthlyIssuedTrend || [],
      }
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load certificate overview charts'))
    }
  },
)

export const issueCertificateAction = createAsyncThunk(
  'certificateManagement/issueCertificateAction',
  async ({ hotelId, validityPeriodInMonths }, { rejectWithValue }) => {
    try {
      return await issueCertificate({ hotelId, validityPeriodInMonths })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to issue certificate'))
    }
  },
)

export const fetchCertificateDetails = createAsyncThunk(
  'certificateManagement/fetchCertificateDetails',
  async (certificateNumber, { rejectWithValue }) => {
    try {
      const response = await getCertificateDetails(certificateNumber)
      return response?.data || null
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load certificate details'))
    }
  },
)

export const fetchCertificateTimeline = createAsyncThunk(
  'certificateManagement/fetchCertificateTimeline',
  async (
    { certificateId, page = 1, limit = 20, order = 'desc', eventType, from, to, append = false },
    { rejectWithValue },
  ) => {
    try {
      const response = await getCertificateTimeline({
        certificateId,
        page,
        limit,
        order,
        eventType,
        from,
        to,
      })

      return {
        items: response?.data?.items || [],
        pagination: response?.data?.pagination || {},
        append,
        requestedPage: page,
      }
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to load activity timeline'))
    }
  },
)

export const updateTrustScoreAction = createAsyncThunk(
  'certificateManagement/updateTrustScoreAction',
  async ({ certificateId, scoreChange, reason }, { rejectWithValue }) => {
    try {
      return await updateTrustScore({ certificateId, scoreChange, reason })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to update trust score'))
    }
  },
)

export const updateCertificateDetailsAction = createAsyncThunk(
  'certificateManagement/updateCertificateDetailsAction',
  async ({
    certificateId,
    hotelId,
    issuedDate,
    expiryDate,
    status,
    trustScore,
    level,
    renewalCount,
    revokedReason,
  }, { rejectWithValue }) => {
    try {
      return await updateCertificateDetails({
        certificateId,
        hotelId,
        issuedDate,
        expiryDate,
        status,
        trustScore,
        level,
        renewalCount,
        revokedReason,
      })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to update certificate details'))
    }
  },
)

export const renewCertificateAction = createAsyncThunk(
  'certificateManagement/renewCertificateAction',
  async ({ certificateId, validityPeriodInMonths }, { rejectWithValue }) => {
    try {
      return await renewCertificate({ certificateId, validityPeriodInMonths })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to renew certificate'))
    }
  },
)

export const revokeCertificateAction = createAsyncThunk(
  'certificateManagement/revokeCertificateAction',
  async ({ certificateId, reason }, { rejectWithValue }) => {
    try {
      return await revokeCertificate({ certificateId, reason })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to revoke certificate'))
    }
  },
)

export const deleteCertificateAction = createAsyncThunk(
  'certificateManagement/deleteCertificateAction',
  async ({ certificateId }, { rejectWithValue }) => {
    try {
      return await deleteCertificatePermanently({ certificateId })
    } catch (error) {
      return rejectWithValue(resolveThunkError(error, 'Failed to permanently delete certificate'))
    }
  },
)

const initialState = {
  statusFilter: 'ALL',
  page: 1,
  limit: 10,
  selectedCertificateId: null,
  certificates: [],
  eligibleHotels: [],
  issuanceHubSummary: {},
  issuanceHubHotels: [],
  certificateDetails: null,
  overviewStats: null,
  overviewCharts: {
    statusDistribution: [],
    levelDistribution: [],
    monthlyIssuedTrend: [],
  },
  timeline: [],
  timelinePage: 1,
  timelineHasNext: false,
  timelineTotal: 0,
  certificatesStatus: 'idle',
  eligibleHotelsStatus: 'idle',
  issuanceHubStatus: 'idle',
  certificateDetailsStatus: 'idle',
  overviewStatsStatus: 'idle',
  overviewChartsStatus: 'idle',
  timelineStatus: 'idle',
  actionStatus: 'idle',
  error: '',
  detailsError: '',
  overviewStatsError: '',
  overviewChartsError: '',
  issuanceHubError: '',
  timelineError: '',
  actionError: '',
  actionSuccess: '',
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
    clearCertificateManagementMessages(state) {
      state.error = ''
      state.detailsError = ''
      state.overviewStatsError = ''
      state.overviewChartsError = ''
      state.issuanceHubError = ''
      state.timelineError = ''
      state.actionError = ''
      state.actionSuccess = ''
    },
    clearCertificateDetailsState(state) {
      state.certificateDetails = null
      state.timeline = []
      state.timelinePage = 1
      state.timelineHasNext = false
      state.timelineTotal = 0
      state.certificateDetailsStatus = 'idle'
      state.timelineStatus = 'idle'
      state.detailsError = ''
      state.timelineError = ''
    },
    resetCertificateManagementState() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.certificatesStatus = 'loading'
        state.error = ''
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.certificatesStatus = 'succeeded'
        state.certificates = action.payload
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.certificatesStatus = 'failed'
        state.error = action.payload || 'Failed to load certificates'
      })
      .addCase(fetchEligibleHotels.pending, (state) => {
        state.eligibleHotelsStatus = 'loading'
        state.error = ''
      })
      .addCase(fetchEligibleHotels.fulfilled, (state, action) => {
        state.eligibleHotelsStatus = 'succeeded'
        state.eligibleHotels = action.payload
      })
      .addCase(fetchEligibleHotels.rejected, (state, action) => {
        state.eligibleHotelsStatus = 'failed'
        state.error = action.payload || 'Failed to load eligible hotels'
      })
      .addCase(fetchIssuanceHubData.pending, (state) => {
        state.issuanceHubStatus = 'loading'
        state.issuanceHubError = ''
      })
      .addCase(fetchIssuanceHubData.fulfilled, (state, action) => {
        state.issuanceHubStatus = 'succeeded'
        state.issuanceHubSummary = action.payload.summary
        state.issuanceHubHotels = action.payload.data
      })
      .addCase(fetchIssuanceHubData.rejected, (state, action) => {
        state.issuanceHubStatus = 'failed'
        state.issuanceHubError = action.payload || 'Failed to load issuance hub data'
      })
      .addCase(fetchCertificateOverviewStats.pending, (state) => {
        state.overviewStatsStatus = 'loading'
        state.overviewStatsError = ''
      })
      .addCase(fetchCertificateOverviewStats.fulfilled, (state, action) => {
        state.overviewStatsStatus = 'succeeded'
        state.overviewStats = action.payload
      })
      .addCase(fetchCertificateOverviewStats.rejected, (state, action) => {
        state.overviewStatsStatus = 'failed'
        state.overviewStatsError = action.payload || 'Failed to load certificate overview stats'
      })
      .addCase(fetchCertificateOverviewCharts.pending, (state) => {
        state.overviewChartsStatus = 'loading'
        state.overviewChartsError = ''
      })
      .addCase(fetchCertificateOverviewCharts.fulfilled, (state, action) => {
        state.overviewChartsStatus = 'succeeded'
        state.overviewCharts = action.payload
      })
      .addCase(fetchCertificateOverviewCharts.rejected, (state, action) => {
        state.overviewChartsStatus = 'failed'
        state.overviewChartsError = action.payload || 'Failed to load certificate overview charts'
      })
      .addCase(fetchCertificateDetails.pending, (state) => {
        state.certificateDetailsStatus = 'loading'
        state.detailsError = ''
      })
      .addCase(fetchCertificateDetails.fulfilled, (state, action) => {
        state.certificateDetailsStatus = 'succeeded'
        state.certificateDetails = action.payload
      })
      .addCase(fetchCertificateDetails.rejected, (state, action) => {
        state.certificateDetailsStatus = 'failed'
        state.detailsError = action.payload || 'Failed to load certificate details'
        state.certificateDetails = null
      })
      .addCase(fetchCertificateTimeline.pending, (state) => {
        state.timelineStatus = 'loading'
        state.timelineError = ''
      })
      .addCase(fetchCertificateTimeline.fulfilled, (state, action) => {
        state.timelineStatus = 'succeeded'

        const { items, pagination, append, requestedPage } = action.payload
        state.timeline = append ? [...state.timeline, ...items] : items
        state.timelinePage = Number(pagination.page) || requestedPage || 1
        state.timelineHasNext = Boolean(pagination.hasNext)
        state.timelineTotal = Number(pagination.total) || state.timeline.length
      })
      .addCase(fetchCertificateTimeline.rejected, (state, action) => {
        state.timelineStatus = 'failed'
        state.timelineError = action.payload || 'Failed to load activity timeline'
      })

    const handleActionPending = (state) => {
      state.actionStatus = 'loading'
      state.actionError = ''
      state.actionSuccess = ''
    }

    const handleActionRejected = (state, action, fallback) => {
      state.actionStatus = 'failed'
      state.actionError = action.payload || fallback
    }

    builder
      .addCase(issueCertificateAction.pending, handleActionPending)
      .addCase(issueCertificateAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Certificate issued successfully.'
      })
      .addCase(issueCertificateAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to issue certificate')
      })
      .addCase(renewCertificateAction.pending, handleActionPending)
      .addCase(renewCertificateAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Certificate renewed successfully.'
      })
      .addCase(renewCertificateAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to renew certificate')
      })
      .addCase(revokeCertificateAction.pending, handleActionPending)
      .addCase(revokeCertificateAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Certificate revoked successfully.'
      })
      .addCase(revokeCertificateAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to revoke certificate')
      })
      .addCase(deleteCertificateAction.pending, handleActionPending)
      .addCase(deleteCertificateAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Certificate permanently deleted.'
      })
      .addCase(deleteCertificateAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to permanently delete certificate')
      })
      .addCase(updateTrustScoreAction.pending, handleActionPending)
      .addCase(updateTrustScoreAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Trust score updated successfully.'
      })
      .addCase(updateTrustScoreAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to update trust score')
      })
      .addCase(updateCertificateDetailsAction.pending, handleActionPending)
      .addCase(updateCertificateDetailsAction.fulfilled, (state) => {
        state.actionStatus = 'succeeded'
        state.actionSuccess = 'Certificate details updated successfully.'
      })
      .addCase(updateCertificateDetailsAction.rejected, (state, action) => {
        handleActionRejected(state, action, 'Failed to update certificate details')
      })
  },
})

export const {
  setCertificateStatusFilter,
  setCertificateManagementPage,
  setCertificateManagementLimit,
  setSelectedCertificateId,
  clearCertificateManagementMessages,
  clearCertificateDetailsState,
  resetCertificateManagementState,
} = certificateManagementSlice.actions

export default certificateManagementSlice.reducer

