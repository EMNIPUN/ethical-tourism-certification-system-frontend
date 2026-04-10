import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import SearchNavbar from '../components/SearchNavbar'
import HotelDetailsPanel from '../components/HotelDetailsPanel'
import {
  addHotelFeedback,
  clearFeedbackMutationState,
  clearSelectedHotel,
  editHotelFeedback,
  loadHotelRecommendations,
  loadSelectedHotel,
  loadSelectedHotelFeedback,
  removeHotelFeedback,
  setSearchActiveTab,
  setSelectedHotelId,
} from '../store/searchSlice'
import {
  selectSearchFeedbackMutationError,
  selectSearchFeedbackMutationStatus,
  selectSearchFeedbackStatus,
  selectSearchRecommendationsStatus,
  selectSearchSelectedFeedback,
  selectSearchSelectedHotel,
  selectSearchSelectedHotelId,
  selectSearchSelectedHotelStatus,
} from '../store/searchSelectors'

function formatLocation(contact) {
  return contact?.businessInfo?.contact?.address || 'Address unavailable'
}

function formatPhone(contact) {
  return contact?.businessInfo?.contact?.phone || 'Phone unavailable'
}

function formatEmail(contact) {
  return contact?.businessInfo?.contact?.email || 'Email unavailable'
}

function formatCertificateLevel(level) {
  return String(level || 'UNRANKED').replace(/_/g, ' ')
}

function formatScore(value) {
  const numericValue = Number(value || 0)
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1)
}

function formatDate(value) {
  if (!value) {
    return 'Recently'
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function HotelDetails() {
  const navigate = useNavigate()
  const { hotelId } = useParams()
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const selectedHotelId = useAppSelector(selectSearchSelectedHotelId)
  const selectedHotel = useAppSelector(selectSearchSelectedHotel)
  const selectedHotelStatus = useAppSelector(selectSearchSelectedHotelStatus)
  const selectedFeedback = useAppSelector(selectSearchSelectedFeedback)
  const feedbackStatus = useAppSelector(selectSearchFeedbackStatus)
  const feedbackMutationStatus = useAppSelector(selectSearchFeedbackMutationStatus)
  const feedbackMutationError = useAppSelector(selectSearchFeedbackMutationError)
  const recommendationsStatus = useAppSelector(selectSearchRecommendationsStatus)

  const [feedbackForm, setFeedbackForm] = useState({ rating: '5', feedback: '' })
  const [editingFeedbackId, setEditingFeedbackId] = useState(null)

  useEffect(() => {
    if (!hotelId) {
      navigate('/search', { replace: true })
      return
    }

    dispatch(setSelectedHotelId(hotelId))
  }, [dispatch, hotelId, navigate])

  useEffect(() => {
    if (!selectedHotelId) {
      return
    }

    dispatch(loadSelectedHotel(selectedHotelId))
    dispatch(loadSelectedHotelFeedback(selectedHotelId))
  }, [dispatch, selectedHotelId])

  useEffect(() => {
    setFeedbackForm({ rating: '5', feedback: '' })
    setEditingFeedbackId(null)
    dispatch(clearFeedbackMutationState())
  }, [dispatch, selectedHotelId])

  const selectedTitle = selectedHotel?.businessInfo?.name || selectedFeedback?.hotelName || 'Hotel details'
  const selectedCertificate = selectedHotel?.certificate
  const selectedReviews = selectedFeedback?.reviews || selectedHotel?.feedbackSummary?.recentFeedbacks || []
  const selectedRating = selectedFeedback?.averageRating ?? selectedHotel?.feedbackSummary?.averageRating ?? 0
  const selectedReviewCount = selectedFeedback?.reviewCount ?? selectedHotel?.feedbackSummary?.reviewCount ?? 0
  const currentUserId = String(user?._id || user?.id || '')
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
  const canManageFeedback = ['tourist', 'admin'].includes(String(user?.role || '').toLowerCase())
  const isFeedbackMutationLoading = feedbackMutationStatus === 'loading'
  const isRecommendationsLoading = recommendationsStatus === 'loading'

  function updateFeedbackField(fieldName, value) {
    setFeedbackForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  function isOwnFeedback(review) {
    return currentUserId && String(review?.userId || '') === currentUserId
  }

  function canEditFeedback(review) {
    return isAdmin || isOwnFeedback(review)
  }

  function resetFeedbackEditor() {
    setFeedbackForm({ rating: '5', feedback: '' })
    setEditingFeedbackId(null)
  }

  function beginEditFeedback(review) {
    setEditingFeedbackId(review.feedbackId)
    setFeedbackForm({
      rating: String(review.rating || 5),
      feedback: review.feedback || '',
    })
    dispatch(clearFeedbackMutationState())
  }

  async function handleFeedbackSubmit(event) {
    event.preventDefault()

    if (!selectedHotelId || isFeedbackMutationLoading) {
      return
    }

    const rating = Number(feedbackForm.rating)
    const feedbackText = feedbackForm.feedback.trim()

    if (rating < 1 || rating > 5 || feedbackText.length < 3) {
      return
    }

    const feedbackAction = editingFeedbackId
      ? editHotelFeedback({
          hotelId: selectedHotelId,
          feedbackId: editingFeedbackId,
          rating,
          feedback: feedbackText,
        })
      : addHotelFeedback({
          hotelId: selectedHotelId,
          rating,
          feedback: feedbackText,
        })

    const result = await dispatch(feedbackAction)

    if (addHotelFeedback.fulfilled.match(result) || editHotelFeedback.fulfilled.match(result)) {
      resetFeedbackEditor()
      dispatch(loadSelectedHotelFeedback(selectedHotelId))
      dispatch(loadSelectedHotel(selectedHotelId))
    }
  }

  async function handleDeleteFeedback(feedbackId) {
    if (!selectedHotelId || !feedbackId || isFeedbackMutationLoading) {
      return
    }

    const confirmed = window.confirm('Delete this feedback? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    const result = await dispatch(removeHotelFeedback({ hotelId: selectedHotelId, feedbackId }))

    if (removeHotelFeedback.fulfilled.match(result)) {
      if (editingFeedbackId === feedbackId) {
        resetFeedbackEditor()
      }
      dispatch(loadSelectedHotelFeedback(selectedHotelId))
      dispatch(loadSelectedHotel(selectedHotelId))
    }
  }

  function handleScrollToFeedback() {
    const target = document.getElementById('feedback-panel')

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function goToSearch(tab = 'discover') {
    dispatch(setSearchActiveTab(tab))
    navigate('/search')
  }

  function handleRefreshRecommendations() {
    if (isRecommendationsLoading) {
      return
    }

    dispatch(setSearchActiveTab('recommendations'))
    dispatch(loadHotelRecommendations())
    navigate('/search')
  }

  return (
    <main className='min-h-screen w-full overflow-x-hidden px-0 py-0'>
      <div className='flex min-h-screen w-full flex-col gap-5'>
        <SearchNavbar
          user={user}
          onShowAll={() => {
            dispatch(clearSelectedHotel())
            goToSearch('discover')
          }}
          onRefreshRecommendations={handleRefreshRecommendations}
          onScrollToFeedback={handleScrollToFeedback}
          onDiscover={() => goToSearch('discover')}
        />

        <section className='w-full px-4 pt-4 sm:px-6 lg:px-8'>
          <button
            type='button'
            onClick={() => goToSearch('discover')}
            className='inline-flex items-center gap-2 rounded-xl border border-[#d1dbeb] bg-white px-4 py-2 text-sm font-semibold text-[#44526d] transition hover:bg-[#f3f6fd]'
          >
            <ArrowLeft size={15} />
            Back to hotel list
          </button>
        </section>

        <section className='glass-panel w-full rounded-none border-x-0 border-white/70 bg-white/85 px-4 py-4 shadow-[0_18px_45px_-36px_rgba(18,29,48,0.45)] sm:px-6 sm:py-5 lg:px-8'>
          <HotelDetailsPanel
            selectedTitle={selectedTitle}
            selectedHotelStatus={selectedHotelStatus}
            feedbackStatus={feedbackStatus}
            selectedHotel={selectedHotel}
            selectedCertificate={selectedCertificate}
            formatCertificateLevel={formatCertificateLevel}
            formatScore={formatScore}
            formatLocation={formatLocation}
            formatPhone={formatPhone}
            formatEmail={formatEmail}
            canManageFeedback={canManageFeedback}
            handleFeedbackSubmit={handleFeedbackSubmit}
            editingFeedbackId={editingFeedbackId}
            feedbackForm={feedbackForm}
            updateFeedbackField={updateFeedbackField}
            feedbackMutationError={feedbackMutationError}
            feedbackMutationStatus={feedbackMutationStatus}
            isFeedbackMutationLoading={isFeedbackMutationLoading}
            resetFeedbackEditor={resetFeedbackEditor}
            selectedRating={selectedRating}
            selectedReviewCount={selectedReviewCount}
            selectedReviews={selectedReviews}
            formatDate={formatDate}
            canEditFeedback={canEditFeedback}
            beginEditFeedback={beginEditFeedback}
            handleDeleteFeedback={handleDeleteFeedback}
          />
        </section>
      </div>
    </main>
  )
}

export default HotelDetails
