import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Building2,
  Filter,
  MapPin,
  MessageSquareText,
  Sparkles,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import SearchNavbar from '../components/SearchNavbar'
import SearchHero from '../components/SearchHero'
import {
  addHotelFeedback,
  clearFeedbackMutationState,
  clearSelectedHotel,
  editHotelFeedback,
  loadHotelContacts,
  loadHotelRecommendations,
  loadSelectedHotel,
  loadSelectedHotelFeedback,
  removeHotelFeedback,
  searchHotels,
  setSearchActiveTab,
  setSearchQuery,
  setSelectedHotelId,
} from '../store/searchSlice'
import {
  selectSearchActiveTab,
  selectSearchContacts,
  selectSearchContactsError,
  selectSearchContactsStatus,
  selectSearchFeedbackError,
  selectSearchFeedbackMutationError,
  selectSearchFeedbackMutationStatus,
  selectSearchFeedbackStatus,
  selectSearchQuery,
  selectSearchRecommendations,
  selectSearchRecommendationsError,
  selectSearchRecommendationsStatus,
  selectSearchSelectedFeedback,
  selectSearchSelectedHotel,
  selectSearchSelectedHotelError,
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

function StarGroup({ value = 0 }) {
  return (
    <div className='flex items-center gap-1 text-amber-500'>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} size={14} fill={index < Math.round(Number(value) || 0) ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

function HotelSearch() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const query = useAppSelector(selectSearchQuery)
  const activeTab = useAppSelector(selectSearchActiveTab)
  const contacts = useAppSelector(selectSearchContacts)
  const contactsStatus = useAppSelector(selectSearchContactsStatus)
  const contactsError = useAppSelector(selectSearchContactsError)
  const selectedHotelId = useAppSelector(selectSearchSelectedHotelId)
  const selectedHotel = useAppSelector(selectSearchSelectedHotel)
  const selectedHotelStatus = useAppSelector(selectSearchSelectedHotelStatus)
  const selectedHotelError = useAppSelector(selectSearchSelectedHotelError)
  const selectedFeedback = useAppSelector(selectSearchSelectedFeedback)
  const feedbackStatus = useAppSelector(selectSearchFeedbackStatus)
  const feedbackError = useAppSelector(selectSearchFeedbackError)
  const feedbackMutationStatus = useAppSelector(selectSearchFeedbackMutationStatus)
  const feedbackMutationError = useAppSelector(selectSearchFeedbackMutationError)
  const recommendations = useAppSelector(selectSearchRecommendations)
  const recommendationsStatus = useAppSelector(selectSearchRecommendationsStatus)
  const recommendationsError = useAppSelector(selectSearchRecommendationsError)
  const isRecommendationsLoading = recommendationsStatus === 'loading'
  const [searchInput, setSearchInput] = useState(query)
  const [feedbackForm, setFeedbackForm] = useState({
    rating: '5',
    feedback: '',
  })
  const [editingFeedbackId, setEditingFeedbackId] = useState(null)

  useEffect(() => {
    dispatch(loadHotelContacts())
    dispatch(loadHotelRecommendations())
  }, [dispatch])

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    if (!selectedHotelId) {
      return
    }

    dispatch(loadSelectedHotel(selectedHotelId))
    dispatch(loadSelectedHotelFeedback(selectedHotelId))
  }, [dispatch, selectedHotelId])

  useEffect(() => {
    if (selectedHotelId || !contacts.length) {
      return
    }

    dispatch(setSelectedHotelId(contacts[0].hotelId))
  }, [contacts, dispatch, selectedHotelId])

  useEffect(() => {
    setFeedbackForm({ rating: '5', feedback: '' })
    setEditingFeedbackId(null)
    dispatch(clearFeedbackMutationState())
  }, [dispatch, selectedHotelId])

  const visibleHotels = activeTab === 'recommendations' ? recommendations?.topHotels || [] : contacts
  const loadingState = activeTab === 'recommendations' ? recommendationsStatus === 'loading' : contactsStatus === 'loading'
  const activeError =
    activeTab === 'recommendations'
      ? recommendationsError || selectedHotelError || feedbackError
      : contactsError || selectedHotelError || feedbackError

  const summaryCards = useMemo(() => {
    const averageRating =
      contacts.length > 0
        ? contacts.reduce((sum, item) => sum + Number(item?.feedbackSummary?.averageRating || 0), 0) / contacts.length
        : 0

    const averageTrustScore =
      contacts.length > 0
        ? contacts.reduce((sum, item) => sum + Number(item?.certificate?.trustScore || 0), 0) / contacts.length
        : 0

    return [
      {
        label: 'Certified hotels',
        value: contacts.length,
        helper:
          activeTab === 'recommendations'
            ? `${recommendations?.totalCertifiedHotels || 0} analyzed by AI`
            : 'Available in discovery list',
        icon: Building2,
      },
      {
        label: 'Average guest rating',
        value: formatScore(averageRating),
        helper: 'Based on feedback summaries',
        icon: Star,
      },
      {
        label: 'Average trust score',
        value: formatScore(averageTrustScore),
        helper: 'From active certificate records',
        icon: ShieldCheck,
      },
      {
        label: 'Signed in as',
        value: user?.role || 'Guest',
        helper: user?.name || user?.email || 'Authenticated session',
        icon: Users,
      },
    ]
  }, [activeTab, contacts, recommendations?.totalCertifiedHotels, user?.email, user?.name, user?.role])

  function runSearch(event) {
    event.preventDefault()

    const trimmedQuery = searchInput.trim()
    dispatch(setSearchQuery(trimmedQuery))
    dispatch(setSearchActiveTab('discover'))
    dispatch(clearSelectedHotel())

    if (!trimmedQuery) {
      dispatch(loadHotelContacts())
      return
    }

    dispatch(searchHotels(trimmedQuery))
  }

  function handleShowAll() {
    setSearchInput('')
    dispatch(setSearchQuery(''))
    dispatch(setSearchActiveTab('discover'))
    dispatch(clearSelectedHotel())
    dispatch(loadHotelContacts())
  }

  function handleRefreshRecommendations() {
    if (isRecommendationsLoading) {
      return
    }

    dispatch(setSearchActiveTab('recommendations'))
    dispatch(loadHotelRecommendations())
  }

  function handleScrollToFeedback() {
    const target = document.getElementById('feedback-panel')

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleSelectHotel(hotelId, sourceTab) {
    dispatch(setSelectedHotelId(hotelId))
    dispatch(setSearchActiveTab(sourceTab))
  }

  const selectedTitle = selectedHotel?.businessInfo?.name || selectedFeedback?.hotelName || 'Pick a hotel'
  const selectedCertificate = selectedHotel?.certificate
  const selectedReviews = selectedFeedback?.reviews || selectedHotel?.feedbackSummary?.recentFeedbacks || []
  const selectedRating = selectedFeedback?.averageRating ?? selectedHotel?.feedbackSummary?.averageRating ?? 0
  const selectedReviewCount = selectedFeedback?.reviewCount ?? selectedHotel?.feedbackSummary?.reviewCount ?? 0
  const currentUserId = String(user?._id || user?.id || '')
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
  const canManageFeedback = ['tourist', 'admin'].includes(String(user?.role || '').toLowerCase())
  const isFeedbackMutationLoading = feedbackMutationStatus === 'loading'

  function getSummaryProgress(card) {
    if (card.label === 'Average guest rating') {
      return Math.min(100, Math.max(0, (Number(card.value || 0) / 5) * 100))
    }

    if (card.label === 'Average trust score') {
      return Math.min(100, Math.max(0, Number(card.value || 0)))
    }

    if (card.label === 'Certified hotels') {
      const referenceTotal = Number(recommendations?.totalCertifiedHotels || contacts.length || 1)
      return Math.min(100, Math.max(0, (Number(card.value || 0) / referenceTotal) * 100))
    }

    return null
  }

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
      dispatch(loadHotelContacts())
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
      dispatch(loadHotelContacts())
    }
  }

  return (
    <main className='min-h-screen w-full overflow-x-hidden px-0 py-0'>
      <div className='flex min-h-screen w-full flex-col gap-5'>
        <SearchNavbar
          user={user}
          onShowAll={handleShowAll}
          onRefreshRecommendations={handleRefreshRecommendations}
          onScrollToFeedback={handleScrollToFeedback}
          onDiscover={() => dispatch(setSearchActiveTab('discover'))}
        />

        <SearchHero
          user={user}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={runSearch}
          onShowAll={handleShowAll}
          onRefreshRecommendations={handleRefreshRecommendations}
          isRefreshingRecommendations={isRecommendationsLoading}
        />

        <section className='w-full px-4 sm:px-6 lg:px-8'>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {summaryCards.map((card) => {
            const Icon = card.icon
            const isIdentityCard = card.label === 'Signed in as'
            const progressValue = getSummaryProgress(card)

            return (
              <article
                key={card.label}
                className={[
                  'glass-panel rounded-3xl border p-4 shadow-[0_16px_40px_-30px_rgba(16,29,52,0.45)] transition hover:-translate-y-0.5',
                  isIdentityCard
                    ? 'border-[#d4dcf0] bg-[linear-gradient(155deg,rgba(39,54,122,0.96),rgba(58,74,154,0.95))] text-white'
                    : 'border-white/70 bg-white/88',
                ].join(' ')}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p
                      className={[
                        'text-[11px] font-semibold uppercase tracking-[0.16em]',
                        isIdentityCard ? 'text-white/70' : 'text-[#7f8ca4]',
                      ].join(' ')}
                    >
                      {card.label}
                    </p>
                    <p
                      className={[
                        'mt-2 text-2xl font-semibold leading-none',
                        isIdentityCard ? 'text-white' : 'text-[#17253f]',
                      ].join(' ')}
                    >
                      {card.value}
                    </p>
                    <p
                      className={[
                        'mt-2 text-sm',
                        isIdentityCard ? 'text-white/80' : 'text-[#65748d]',
                      ].join(' ')}
                    >
                      {card.helper}
                    </p>
                  </div>

                  <div
                    className={[
                      'inline-flex h-10 w-10 items-center justify-center rounded-2xl',
                      isIdentityCard ? 'bg-white/15 text-white' : 'bg-[#edf2ff] text-[#5868d8]',
                    ].join(' ')}
                  >
                    <Icon size={18} />
                  </div>
                </div>

                {isIdentityCard ? (
                  <div className='mt-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2'>
                    <p className='truncate text-sm font-semibold text-white'>{user?.name || user?.email || 'Guest user'}</p>
                    <p className='mt-0.5 text-[11px] uppercase tracking-[0.12em] text-white/70'>Secure authenticated session</p>
                  </div>
                ) : (
                  <div className='mt-4'>
                    <div className='h-2 rounded-full bg-[#e7edfb]'>
                      <div
                        className='h-2 rounded-full bg-[linear-gradient(90deg,#5868d8,#6f7cff)] transition-all duration-500'
                        style={{ width: `${progressValue || 0}%` }}
                      />
                    </div>
                    <p className='mt-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8d98af]'>
                      {Math.round(progressValue || 0)}% benchmark
                    </p>
                  </div>
                )}
              </article>
            )
          })}
          </div>
        </section>

        <section className='glass-panel w-full rounded-none border-x-0 border-white/70 bg-white/85 px-4 py-4 shadow-[0_18px_45px_-36px_rgba(18,29,48,0.45)] sm:px-6 sm:py-5 lg:px-8'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8ca7]'>Explore</p>
              <h2 className='mt-1 text-xl font-semibold text-[#17253f]'>
                {activeTab === 'recommendations' ? 'AI ranked hotels' : 'Certified hotel discovery'}
              </h2>
            </div>

            <div className='flex items-center gap-2 rounded-2xl border border-[#d8e0ef] bg-[#f9fbff] p-1'>
              <button
                type='button'
                onClick={() => dispatch(setSearchActiveTab('discover'))}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                  activeTab === 'discover' ? 'bg-white text-[#1f2d49] shadow-[0_10px_24px_-20px_rgba(14,25,44,0.45)]' : 'text-[#5f6f89]',
                ].join(' ')}
              >
                <Filter size={15} />
                Discover
              </button>
              <button
                type='button'
                onClick={() => dispatch(setSearchActiveTab('recommendations'))}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
                  activeTab === 'recommendations'
                    ? 'bg-white text-[#1f2d49] shadow-[0_10px_24px_-20px_rgba(14,25,44,0.45)]'
                    : 'text-[#5f6f89]',
                ].join(' ')}
              >
                <Sparkles size={15} />
                AI ranking
              </button>
            </div>
          </div>

          {activeError ? <div className='notice-error mt-4'>{activeError}</div> : null}

          <div className='mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]'>
            <div>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-[#1f2d49]'>
                  {activeTab === 'recommendations' ? 'Top ranked hotels' : 'Search results'}
                </p>
                <p className='text-xs text-[#73839e]'>
                  {loadingState ? 'Loading data...' : `${visibleHotels.length} results available`}
                </p>
              </div>

              {activeTab === 'recommendations' && recommendations?.aiAnalysis ? (
                <div className='mt-3 rounded-2xl border border-[#dce4f1] bg-[#f7faff] p-4 text-sm text-[#516079]'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>AI analysis</p>
                  <p className='mt-2 leading-6'>{recommendations.aiAnalysis}</p>
                  {recommendations?.bestHotel?.recommendation ? (
                    <p className='mt-3 rounded-xl bg-white px-3 py-2 text-sm text-[#22314f] shadow-[0_10px_24px_-20px_rgba(14,25,44,0.45)]'>
                      Best hotel reason: {recommendations.bestHotel.recommendation}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className='mt-4 grid gap-3'>
                {activeTab === 'recommendations' && recommendationsStatus === 'loading'
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`recommendation-skeleton-${index}`}
                        className='h-32 animate-pulse rounded-2xl border border-dashed border-[#d9e2ef] bg-[#f7f9fd]'
                      />
                    ))
                  : null}

                {activeTab === 'discover' && contactsStatus === 'loading'
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`contact-skeleton-${index}`}
                        className='h-32 animate-pulse rounded-2xl border border-dashed border-[#d9e2ef] bg-[#f7f9fd]'
                      />
                    ))
                  : null}

                {!loadingState && visibleHotels.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-[#d9e2ef] bg-[#f7f9fd] px-5 py-10 text-center'>
                    <p className='text-base font-semibold text-[#1f2d49]'>No hotels found</p>
                    <p className='mt-1 text-sm text-[#64758f]'>Try a different location or load the full certified list.</p>
                  </div>
                ) : null}

                {visibleHotels.map((hotel) => {
                  const hotelId = hotel.hotelId || hotel.hotelId?._id || hotel._id
                  const isSelected = String(selectedHotelId) === String(hotelId)
                  const rating = hotel.feedbackRating ?? hotel.feedbackSummary?.averageRating ?? 0
                  const reviewCount = hotel.reviewCount ?? hotel.feedbackSummary?.reviewCount ?? 0
                  const trustScore = hotel.trustScore ?? hotel.certificate?.trustScore ?? 0
                  const score = hotel.combinedScore ?? hotel.certificate?.trustScore ?? 0

                  return (
                    <button
                      key={String(hotelId)}
                      type='button'
                      onClick={() => handleSelectHotel(hotelId, activeTab)}
                      className={[
                        'rounded-2xl border p-4 text-left transition',
                        isSelected
                          ? 'border-(--brand-700) bg-[#f6f8ff] shadow-[0_18px_32px_-30px_rgba(39,54,122,0.55)]'
                          : 'border-[#dce4f1] bg-white hover:border-[#bfcbea] hover:bg-[#fbfcff]',
                      ].join(' ')}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <div className='flex flex-wrap items-center gap-2'>
                            <h3 className='text-base font-semibold text-[#16243d]'>
                              {hotel.hotelName || hotel.businessInfo?.name || 'Unnamed hotel'}
                            </h3>
                            <span className='rounded-full border border-[#d7e1ef] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52627d]'>
                              {formatCertificateLevel(hotel.certificateLevel || hotel.certificate?.level)}
                            </span>
                          </div>
                          <p className='mt-2 flex items-start gap-2 text-sm text-[#607087]'>
                            <MapPin size={15} className='mt-0.5 shrink-0 text-[#7d8ca7]' />
                            <span>{formatLocation(hotel)}</span>
                          </p>
                        </div>

                        <span className='rounded-2xl bg-[#edf2ff] px-3 py-2 text-right text-xs font-semibold text-(--brand-700)'>
                          {activeTab === 'recommendations' ? `Rank #${hotel.rank}` : `Trust ${formatScore(trustScore)}`}
                        </span>
                      </div>

                      <div className='mt-4 grid gap-3 sm:grid-cols-3'>
                        <div className='rounded-xl bg-[#f8faff] px-3 py-2'>
                          <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Score</p>
                          <p className='mt-1 text-sm font-semibold text-[#1f2d49]'>
                            {activeTab === 'recommendations' ? formatScore(score) : formatScore(trustScore)}
                          </p>
                        </div>
                        <div className='rounded-xl bg-[#f8faff] px-3 py-2'>
                          <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Rating</p>
                          <p className='mt-1 text-sm font-semibold text-[#1f2d49]'>{formatScore(rating)}/5</p>
                        </div>
                        <div className='rounded-xl bg-[#f8faff] px-3 py-2'>
                          <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Reviews</p>
                          <p className='mt-1 text-sm font-semibold text-[#1f2d49]'>{reviewCount}</p>
                        </div>
                      </div>

                      <div className='mt-4 flex items-center justify-between text-sm text-[#5e6e88]'>
                        <span className='inline-flex items-center gap-2'>
                          <Users size={15} />
                          {activeTab === 'recommendations' ? 'AI ranked discovery' : formatEmail(hotel)}
                        </span>
                        <ArrowRight size={15} className='text-[#7b8aad]' />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <aside className='rounded-3xl border border-[#dce4f1] bg-[#fbfcff] p-4 shadow-[0_14px_34px_-28px_rgba(20,31,54,0.45)]'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Selected hotel</p>
                  <h3 className='mt-1 text-xl font-semibold text-[#16243d]'>{selectedTitle}</h3>
                </div>
                {selectedHotelStatus === 'loading' || feedbackStatus === 'loading' ? (
                  <span className='rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-(--brand-700)'>
                    Loading
                  </span>
                ) : null}
              </div>

              {selectedHotel ? (
                <div className='mt-4 space-y-4'>
                  <div id='feedback-panel' className='rounded-2xl border border-[#e1e8f3] bg-white p-4'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
                      <ShieldCheck size={16} className='text-(--brand-700)' />
                      Certificate overview
                    </div>
                    <div className='mt-3 grid gap-3 text-sm text-[#516079]'>
                      <div className='flex items-center justify-between gap-3'>
                        <span>Level</span>
                        <span className='font-semibold text-[#1f2d49]'>
                          {formatCertificateLevel(selectedCertificate?.level || selectedHotel.certificate?.level)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between gap-3'>
                        <span>Status</span>
                        <span className='font-semibold text-[#1f2d49]'>{selectedCertificate?.status || 'ACTIVE'}</span>
                      </div>
                      <div className='flex items-center justify-between gap-3'>
                        <span>Trust score</span>
                        <span className='font-semibold text-[#1f2d49]'>
                          {formatScore(selectedCertificate?.trustScore || selectedHotel.certificate?.trustScore || 0)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between gap-3'>
                        <span>Certificate number</span>
                        <span className='font-semibold text-[#1f2d49]'>
                          {selectedCertificate?.certificateNumber || 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='rounded-2xl border border-[#e1e8f3] bg-white p-4'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
                      <Building2 size={16} className='text-(--brand-700)' />
                      Contact details
                    </div>
                    <div className='mt-3 space-y-3 text-sm text-[#516079]'>
                      <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Address</p>
                        <p className='mt-1 text-[#1f2d49]'>{formatLocation(selectedHotel)}</p>
                      </div>
                      <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Phone</p>
                        <p className='mt-1 text-[#1f2d49]'>{formatPhone(selectedHotel)}</p>
                      </div>
                      <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Email</p>
                        <p className='mt-1 text-[#1f2d49]'>{formatEmail(selectedHotel)}</p>
                      </div>
                      <div>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Coordinates</p>
                        <p className='mt-1 text-[#1f2d49]'>
                          {selectedHotel.businessInfo?.contact?.gps?.latitude || 'N/A'},{' '}
                          {selectedHotel.businessInfo?.contact?.gps?.longitude || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='rounded-2xl border border-[#e1e8f3] bg-white p-4'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
                      <MessageSquareText size={16} className='text-(--brand-700)' />
                      Guest feedback
                    </div>

                    {canManageFeedback ? (
                      <form onSubmit={handleFeedbackSubmit} className='mt-4 space-y-3 rounded-xl border border-[#dbe4f1] bg-[#f8faff] p-3'>
                        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#60708a]'>
                          {editingFeedbackId ? 'Edit your feedback' : 'Share your feedback'}
                        </p>

                        <div className='grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]'>
                          <label className='text-sm font-semibold text-[#1f2d49]'>
                            Rating
                            <select
                              value={feedbackForm.rating}
                              onChange={(event) => updateFeedbackField('rating', event.target.value)}
                              className='form-select mt-1'
                            >
                              <option value='5'>5 - Excellent</option>
                              <option value='4'>4 - Very good</option>
                              <option value='3'>3 - Good</option>
                              <option value='2'>2 - Fair</option>
                              <option value='1'>1 - Poor</option>
                            </select>
                          </label>

                          <label className='text-sm font-semibold text-[#1f2d49]'>
                            Comment
                            <textarea
                              value={feedbackForm.feedback}
                              onChange={(event) => updateFeedbackField('feedback', event.target.value)}
                              rows={3}
                              minLength={3}
                              maxLength={1000}
                              placeholder='Share your hotel experience...'
                              className='form-input mt-1 resize-none'
                            />
                          </label>
                        </div>

                        {feedbackMutationError ? <p className='notice-error'>{feedbackMutationError}</p> : null}
                        {feedbackMutationStatus === 'succeeded' ? (
                          <p className='notice-success'>Feedback updated successfully.</p>
                        ) : null}

                        <div className='flex flex-wrap items-center gap-2'>
                          <button
                            type='submit'
                            disabled={isFeedbackMutationLoading || feedbackForm.feedback.trim().length < 3}
                            className='inline-flex items-center justify-center rounded-xl bg-(--brand-700) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {isFeedbackMutationLoading
                              ? 'Saving...'
                              : editingFeedbackId
                                ? 'Update feedback'
                                : 'Post feedback'}
                          </button>

                          {editingFeedbackId ? (
                            <button
                              type='button'
                              onClick={resetFeedbackEditor}
                              className='inline-flex items-center justify-center rounded-xl border border-[#d1dbeb] bg-white px-4 py-2 text-sm font-semibold text-[#44526d] transition hover:bg-[#f3f6fd]'
                            >
                              Cancel edit
                            </button>
                          ) : null}
                        </div>
                      </form>
                    ) : null}

                    <div className='mt-3 flex items-center justify-between gap-3'>
                      <div>
                        <p className='text-2xl font-semibold text-[#16243d]'>{formatScore(selectedRating)}</p>
                        <p className='text-sm text-[#65748d]'>{selectedReviewCount} reviews</p>
                      </div>
                      <StarGroup value={selectedRating} />
                    </div>

                    <div className='mt-4 space-y-3'>
                      {selectedReviews.length > 0 ? (
                        selectedReviews.map((review, index) => (
                          <article
                            key={`${review.feedbackId || review.createdAt || index}`}
                            className='rounded-xl bg-[#f8faff] px-3 py-3'
                          >
                            <div className='flex items-center justify-between gap-3'>
                              <p className='text-sm font-semibold text-[#1f2d49]'>{review.userName || 'Guest reviewer'}</p>
                              <span className='text-xs text-[#73839e]'>{formatDate(review.createdAt)}</span>
                            </div>
                            <div className='mt-2 flex items-center gap-2'>
                              <StarGroup value={review.rating} />
                              <span className='text-xs font-semibold text-[#64738d]'>{review.rating}/5</span>
                            </div>
                            <p className='mt-2 text-sm leading-6 text-[#516079]'>
                              {review.feedback || 'No written feedback provided.'}
                            </p>

                            {review.feedbackId && canEditFeedback(review) ? (
                              <div className='mt-3 flex items-center gap-2'>
                                <button
                                  type='button'
                                  onClick={() => beginEditFeedback(review)}
                                  className='rounded-lg border border-[#d1dbeb] bg-white px-3 py-1.5 text-xs font-semibold text-[#45546e] transition hover:bg-[#f2f6fd]'
                                >
                                  Edit
                                </button>
                                <button
                                  type='button'
                                  onClick={() => handleDeleteFeedback(review.feedbackId)}
                                  className='rounded-lg border border-[#efc9c9] bg-white px-3 py-1.5 text-xs font-semibold text-[#8a3e3e] transition hover:bg-[#fff3f3]'
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </article>
                        ))
                      ) : (
                        <div className='rounded-xl border border-dashed border-[#d9e2ef] bg-[#f8faff] px-4 py-6 text-sm text-[#65748d]'>
                          No review details are available for this hotel yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='mt-4 rounded-2xl border border-dashed border-[#d9e2ef] bg-white/70 px-4 py-8 text-sm text-[#65748d]'>
                  Select a hotel from the list to inspect certificate details, contact information, and recent guest
                  reviews.
                </div>
              )}

              {(selectedHotelStatus === 'failed' || feedbackStatus === 'failed') && !selectedHotel ? (
                <div className='notice-error mt-4'>Unable to load the selected hotel details. Please choose another result.</div>
              ) : null}
            </aside>
          </div>
        </section>

        <section className='w-full px-4 pb-6 sm:px-6 lg:px-8'>
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.68fr)]'>
          <article className='glass-panel rounded-3xl border border-white/70 bg-white/80 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2ff] text-(--brand-700)'>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#17253f]'>Search workflow</h3>
                <p className='mt-1 text-sm leading-6 text-[#65748d]'>
                  The dashboard uses Redux for query state, API loading, selected hotel details, feedback summaries,
                  and AI ranking results. That keeps the page predictable even when you switch between discovery and
                  recommendation views.
                </p>
              </div>
            </div>
          </article>

          <article className='glass-panel rounded-3xl border border-white/70 bg-white/80 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2ff] text-(--brand-700)'>
                <Zap size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#17253f]'>Backend endpoints used</h3>
                <p className='mt-1 text-sm leading-6 text-[#65748d]'>
                  Contacts, location search, hotel feedback, and AI recommendations all map directly to the search
                  module routes mounted under the API v1 prefix.
                </p>
              </div>
            </div>
          </article>
          </div>
        </section>
      </div>
    </main>
  )
}

export default HotelSearch

