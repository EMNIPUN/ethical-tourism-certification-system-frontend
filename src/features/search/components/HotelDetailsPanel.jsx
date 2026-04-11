import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Images,
  MessageSquareText,
  ShieldCheck,
  Star,
  Trees,
  X,
} from 'lucide-react'

const MOCK_IMAGE_COLLECTIONS = {
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
  ],
  rooms: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80',
  ],
  outdoor: [
    'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1519821172141-b5d8a4b9f3d0?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1600&q=80',
  ],
}

const GALLERY_SECTIONS = [
  { key: 'hotel', title: 'Hotel collection', description: 'Lobby, facade, and signature spaces', icon: Hotel },
  { key: 'rooms', title: 'Rooms collection', description: 'Suites, interiors, and comfort details', icon: BedDouble },
  { key: 'outdoor', title: 'Outdoor collection', description: 'Gardens, pool, and eco landscape', icon: Trees },
]

function resolveLevelTheme(level) {
  const normalized = String(level || '').toUpperCase()

  if (normalized === 'PLATINUM') {
    return {
      badge: 'border-violet-200 bg-violet-50 text-violet-700',
      panel: 'from-violet-50 to-indigo-50 border-violet-100',
    }
  }

  if (normalized === 'GOLD') {
    return {
      badge: 'border-amber-200 bg-amber-50 text-amber-700',
      panel: 'from-amber-50 to-yellow-50 border-amber-100',
    }
  }

  if (normalized === 'SILVER') {
    return {
      badge: 'border-slate-200 bg-slate-50 text-slate-700',
      panel: 'from-slate-50 to-sky-50 border-slate-100',
    }
  }

  return {
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
    panel: 'from-blue-50 to-indigo-50 border-blue-100',
  }
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

function HotelDetailsPanel({
  selectedTitle,
  selectedHotelStatus,
  feedbackStatus,
  selectedHotel,
  selectedCertificate,
  formatCertificateLevel,
  formatScore,
  formatLocation,
  formatPhone,
  formatEmail,
  canManageFeedback,
  handleFeedbackSubmit,
  editingFeedbackId,
  feedbackForm,
  updateFeedbackField,
  feedbackMutationError,
  feedbackMutationStatus,
  isFeedbackMutationLoading,
  resetFeedbackEditor,
  selectedRating,
  selectedReviewCount,
  selectedReviews,
  formatDate,
  canEditFeedback,
  beginEditFeedback,
  handleDeleteFeedback,
}) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryImageIndex, setGalleryImageIndex] = useState(0)

  const selectedLevel = selectedCertificate?.level || selectedHotel?.certificate?.level || 'UNRANKED'
  const levelTheme = resolveLevelTheme(selectedLevel)

  const imageCollections = useMemo(() => {
    const hotelImages = selectedHotel?.media?.hotelImages || selectedHotel?.images?.hotel || []
    const roomImages = selectedHotel?.media?.roomImages || selectedHotel?.images?.rooms || []
    const outdoorImages = selectedHotel?.media?.outdoorImages || selectedHotel?.images?.outdoor || []

    return {
      hotel: hotelImages.length ? hotelImages : MOCK_IMAGE_COLLECTIONS.hotel,
      rooms: roomImages.length ? roomImages : MOCK_IMAGE_COLLECTIONS.rooms,
      outdoor: outdoorImages.length ? outdoorImages : MOCK_IMAGE_COLLECTIONS.outdoor,
    }
  }, [selectedHotel])

  const flatGalleryImages = useMemo(
    () => [...imageCollections.hotel, ...imageCollections.rooms, ...imageCollections.outdoor],
    [imageCollections.hotel, imageCollections.outdoor, imageCollections.rooms],
  )

  useEffect(() => {
    function handleEscKey(event) {
      if (event.key === 'Escape') {
        setIsGalleryOpen(false)
      }
    }

    if (!isGalleryOpen) {
      return undefined
    }

    window.addEventListener('keydown', handleEscKey)

    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [isGalleryOpen])

  function openGalleryAtIndex(index) {
    setGalleryImageIndex(index)
    setIsGalleryOpen(true)
  }

  function nextGalleryImage() {
    if (!flatGalleryImages.length) {
      return
    }

    setGalleryImageIndex((currentIndex) => (currentIndex + 1) % flatGalleryImages.length)
  }

  function previousGalleryImage() {
    if (!flatGalleryImages.length) {
      return
    }

    setGalleryImageIndex((currentIndex) => (currentIndex - 1 + flatGalleryImages.length) % flatGalleryImages.length)
  }

  return (
    <aside className='rounded-3xl border border-[#dce4f1] bg-[linear-gradient(150deg,#fbfcff,#f5f8ff)] p-4 shadow-[0_18px_42px_-30px_rgba(20,31,54,0.45)] sm:p-5'>
      <div className='rounded-2xl border border-[#d9e3f2] bg-white/90 p-4 sm:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Selected hotel</p>
          <h3 className='mt-1 text-2xl font-semibold tracking-tight text-[#16243d]'>{selectedTitle}</h3>
          <p className='mt-1 text-sm text-[#6a7a95]'>Detailed stay profile for travelers, including trust insights and visual collections.</p>
        </div>
        {selectedHotelStatus === 'loading' || feedbackStatus === 'loading' ? (
          <span className='rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-(--brand-700)'>
            Loading
          </span>
        ) : null}
      </div>

      {selectedHotel ? (
        <div className='mt-5 grid gap-4 xl:grid-cols-12'>
          <div className='rounded-2xl border border-[#dbe4f1] bg-white p-4 xl:col-span-8'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
                <Images size={16} className='text-(--brand-700)' />
                Hotel image collections
              </div>
              <button
                type='button'
                onClick={() => openGalleryAtIndex(0)}
                className='inline-flex items-center gap-1 rounded-lg border border-[#d4def0] bg-[#f6f9ff] px-3 py-1.5 text-xs font-semibold text-[#2c467f] transition hover:bg-[#edf3ff]'
              >
                View all images
                <ChevronRight size={14} />
              </button>
            </div>

            <div className='space-y-3'>
              {GALLERY_SECTIONS.map((section) => {
                const SectionIcon = section.icon
                const images = imageCollections[section.key] || []
                const sectionStartIndex =
                  section.key === 'hotel'
                    ? 0
                    : section.key === 'rooms'
                      ? imageCollections.hotel.length
                      : imageCollections.hotel.length + imageCollections.rooms.length

                return (
                  <div key={section.key} className='rounded-xl border border-[#e2e8f4] bg-[linear-gradient(145deg,#fbfdff,#f8fbff)] p-3'>
                    <div className='mb-2 flex items-center justify-between gap-2'>
                      <div>
                        <p className='inline-flex items-center gap-2 text-sm font-semibold text-[#1f2d49]'>
                          <SectionIcon size={14} className='text-[#5368aa]' />
                          {section.title}
                        </p>
                        <p className='text-xs text-[#70809a]'>{section.description}</p>
                      </div>
                      <p className='rounded-full border border-[#d8e0ef] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#566784]'>
                        {images.length} images
                      </p>
                    </div>

                    <div className='grid grid-cols-3 gap-2'>
                      {images.slice(0, 3).map((imageUrl, index) => (
                        <button
                          key={`${section.key}-${index}`}
                          type='button'
                          onClick={() => openGalleryAtIndex(sectionStartIndex + index)}
                          className='group relative overflow-hidden rounded-lg border border-[#d8e2f1]'
                        >
                          <img
                            src={imageUrl}
                            alt={`${section.title} preview ${index + 1}`}
                            className='h-24 w-full object-cover transition duration-200 group-hover:scale-105'
                            loading='lazy'
                          />
                          <span className='absolute inset-0 bg-black/0 transition group-hover:bg-black/20' />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='rounded-2xl border border-[#e1e8f3] bg-white p-4 xl:col-span-4'>
            <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
              <ShieldCheck size={16} className='text-(--brand-700)' />
              Trust and certification
            </div>

            <div className={`mt-3 rounded-xl border bg-linear-to-br p-3.5 ${levelTheme.panel}`}>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-[#54637f]'>Certification level</p>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${levelTheme.badge}`}>
                  {formatCertificateLevel(selectedLevel)}
                </span>
              </div>
              <div className='mt-2 flex items-center justify-between gap-3'>
                <p className='text-sm text-[#485a79]'>Trust score</p>
                <p className='inline-flex items-center gap-1 text-base font-bold text-[#1f2d49]'>
                  <BadgeCheck size={15} className='text-[#4764ab]' />
                  {formatScore(selectedCertificate?.trustScore || selectedHotel.certificate?.trustScore || 0)}
                </p>
              </div>
              <div className='mt-2 h-2 rounded-full bg-white/70'>
                <div
                  className='h-2 rounded-full bg-[linear-gradient(90deg,#4764ab,#6b7fd1)]'
                  style={{ width: `${Math.max(0, Math.min(100, Number(selectedCertificate?.trustScore || selectedHotel.certificate?.trustScore || 0)))}%` }}
                />
              </div>
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

          <div className='rounded-2xl border border-[#e1e8f3] bg-white p-4 xl:col-span-4'>
            <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
              <Building2 size={16} className='text-(--brand-700)' />
              Contact details
            </div>
            <div className='mt-3 grid gap-2 text-sm text-[#516079]'>
              <div className='rounded-xl border border-[#e6edf7] bg-[#f9fbff] p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Address</p>
                <p className='mt-1 text-[#1f2d49]'>{formatLocation(selectedHotel)}</p>
              </div>
              <div className='rounded-xl border border-[#e6edf7] bg-[#f9fbff] p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Phone</p>
                <p className='mt-1 text-[#1f2d49]'>{formatPhone(selectedHotel)}</p>
              </div>
              <div className='rounded-xl border border-[#e6edf7] bg-[#f9fbff] p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Email</p>
                <p className='mt-1 text-[#1f2d49]'>{formatEmail(selectedHotel)}</p>
              </div>
              <div className='rounded-xl border border-[#e6edf7] bg-[#f9fbff] p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7f8ca4]'>Coordinates</p>
                <p className='mt-1 text-[#1f2d49]'>
                  {selectedHotel.businessInfo?.contact?.gps?.latitude || 'N/A'},{' '}
                  {selectedHotel.businessInfo?.contact?.gps?.longitude || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div id='feedback-panel' className='rounded-2xl border border-[#e1e8f3] bg-white p-4 xl:col-span-8'>
            <div className='flex items-center gap-2 text-sm font-semibold text-[#22314f]'>
              <MessageSquareText size={16} className='text-(--brand-700)' />
              Guest feedback
            </div>

            {canManageFeedback ? (
              <form onSubmit={handleFeedbackSubmit} className='mt-4 space-y-3 rounded-xl border border-[#dbe4f1] bg-[linear-gradient(145deg,#f8faff,#f2f7ff)] p-3'>
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
                {feedbackMutationStatus === 'succeeded' ? <p className='notice-success'>Feedback updated successfully.</p> : null}

                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='submit'
                    disabled={isFeedbackMutationLoading || feedbackForm.feedback.trim().length < 3}
                    className='inline-flex items-center justify-center rounded-xl bg-(--brand-700) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isFeedbackMutationLoading ? 'Saving...' : editingFeedbackId ? 'Update feedback' : 'Post feedback'}
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

            <div className='mt-4 grid gap-3'>
              {selectedReviews.length > 0 ? (
                selectedReviews.map((review, index) => (
                  <article
                    key={`${review.feedbackId || review.createdAt || index}`}
                    className='rounded-xl border border-[#e3eaf6] bg-[linear-gradient(145deg,#f8faff,#f3f7ff)] px-3 py-3'
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
          Select a hotel from the list to inspect certificate details, contact information, and recent guest reviews.
        </div>
      )}
      </div>

      {(selectedHotelStatus === 'failed' || feedbackStatus === 'failed') && !selectedHotel ? (
        <div className='notice-error mt-4'>Unable to load the selected hotel details. Please choose another result.</div>
      ) : null}

      {isGalleryOpen && flatGalleryImages.length > 0 ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='relative w-full max-w-5xl overflow-hidden rounded-2xl border border-[#cad6ec] bg-[#0f1728] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.72)]'>
            <button
              type='button'
              onClick={() => setIsGalleryOpen(false)}
              className='absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:bg-black/45'
            >
              <X size={17} />
            </button>

            <img
              src={flatGalleryImages[galleryImageIndex]}
              alt={`Gallery image ${galleryImageIndex + 1}`}
              className='h-[56vh] w-full bg-black object-cover sm:h-[62vh]'
            />

            <button
              type='button'
              onClick={previousGalleryImage}
              className='absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/50'
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type='button'
              onClick={nextGalleryImage}
              className='absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white transition hover:bg-black/50'
            >
              <ChevronRight size={18} />
            </button>

            <div className='flex items-center justify-between bg-[#0b1322] px-4 py-3 text-sm text-white/85'>
              <p className='font-semibold'>Hotel media collection</p>
              <p>
                {galleryImageIndex + 1} / {flatGalleryImages.length}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

export default HotelDetailsPanel
