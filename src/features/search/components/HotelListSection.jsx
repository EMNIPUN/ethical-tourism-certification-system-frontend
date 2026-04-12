import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Filter, Grid2x2, List, MapPin, Sparkles } from 'lucide-react'

const MOCK_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
]

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Mullaitivu',
  'Vavuniya',
  'Trincomalee',
  'Batticaloa',
  'Ampara',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
]

const QUICK_DISTRICTS = ['Colombo', 'Kandy', 'Galle', 'Nuwara Eliya', 'Jaffna', 'Trincomalee']

function getTrustTone(score) {
  if (score >= 85) {
    return {
      label: 'Exceptional trust',
      ring: 'ring-emerald-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-500',
    }
  }

  if (score >= 70) {
    return {
      label: 'Strong trust',
      ring: 'ring-sky-200',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      bar: 'bg-sky-500',
    }
  }

  return {
    label: 'Growing trust',
    ring: 'ring-amber-200',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
  }
}

function getMockImage(index) {
  return MOCK_HOTEL_IMAGES[index % MOCK_HOTEL_IMAGES.length]
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveHotelDistrict(hotel) {
  const address = normalizeText(hotel?.businessInfo?.contact?.address)

  const matched = SRI_LANKA_DISTRICTS.find((district) => {
    const normalizedDistrict = normalizeText(district)
    return address.includes(normalizedDistrict)
  })

  return matched || 'Other'
}

function HotelListSection({
  activeTab,
  onSwitchTab,
  activeError,
  loadingState,
  visibleHotels,
  recommendations,
  recommendationsStatus,
  contactsStatus,
  selectedHotelId,
  onSelectHotel,
  formatCertificateLevel,
  formatLocation,
  formatScore,
  formatEmail,
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('All districts')
  const [viewMode, setViewMode] = useState('grid')

  const hotelsWithDistrict = useMemo(
    () => visibleHotels.map((hotel) => ({ ...hotel, district: resolveHotelDistrict(hotel) })),
    [visibleHotels],
  )

  const districtFilteredHotels = useMemo(() => {
    if (selectedDistrict === 'All districts') {
      return hotelsWithDistrict
    }

    return hotelsWithDistrict.filter((hotel) => hotel.district === selectedDistrict)
  }, [hotelsWithDistrict, selectedDistrict])

  const availableDistricts = useMemo(() => {
    const unique = Array.from(new Set(hotelsWithDistrict.map((hotel) => hotel.district))).filter(Boolean)
    const known = unique.filter((district) => district !== 'Other').sort((a, b) => a.localeCompare(b))
    return unique.includes('Other') ? [...known, 'Other'] : known
  }, [hotelsWithDistrict])

  const quickDistricts = QUICK_DISTRICTS.filter((district) => availableDistricts.includes(district))

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04, duration: 0.35 }}
        className='flex flex-col gap-3 rounded-3xl border border-[#dbe4f1] bg-[linear-gradient(145deg,#ffffff,#f7faff)] p-4 shadow-[0_18px_35px_-30px_rgba(20,31,54,0.45)] lg:flex-row lg:items-center lg:justify-between'
      >
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d8ca7]'>Hotel intelligence desk</p>
          <h2 className='mt-1 text-xl font-semibold text-[#17253f]'>
            {activeTab === 'recommendations' ? 'AI ranked hotels' : 'Certified hotel discovery'}
          </h2>
          <p className='mt-1 text-sm text-[#60708a]'>Professional review view with trust-first scoring and visual hotel previews.</p>
        </div>

        <div className='flex items-center gap-2 rounded-2xl border border-[#d8e0ef] bg-[#f9fbff] p-1'>
          <button
            type='button'
            onClick={() => onSwitchTab('discover')}
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
            onClick={() => onSwitchTab('recommendations')}
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
      </motion.div>

      {activeError ? <div className='notice-error mt-4'>{activeError}</div> : null}

      <div className='mt-5'>
        <div className='mb-4 rounded-2xl border border-[#dbe4f1] bg-[linear-gradient(145deg,#ffffff,#f8fbff)] p-3'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
              <label className='inline-flex items-center gap-2 rounded-xl border border-[#d9e2f1] bg-white px-3 py-2 text-sm font-semibold text-[#415574]'>
                <MapPin size={14} className='text-[#4f66aa]' />
                District
                <select
                  value={selectedDistrict}
                  onChange={(event) => setSelectedDistrict(event.target.value)}
                  className='bg-transparent font-semibold text-[#22314f] outline-none'
                >
                  <option>All districts</option>
                  {availableDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>

              <div className='inline-flex items-center rounded-xl border border-[#d9e2f1] bg-white p-1'>
                <button
                  type='button'
                  onClick={() => setViewMode('grid')}
                  className={[
                    'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    viewMode === 'grid' ? 'bg-[#edf2ff] text-[#324b86]' : 'text-[#637692] hover:bg-[#f5f8ff]',
                  ].join(' ')}
                >
                  <Grid2x2 size={14} />
                  Grid
                </button>
                <button
                  type='button'
                  onClick={() => setViewMode('list')}
                  className={[
                    'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    viewMode === 'list' ? 'bg-[#edf2ff] text-[#324b86]' : 'text-[#637692] hover:bg-[#f5f8ff]',
                  ].join(' ')}
                >
                  <List size={14} />
                  List
                </button>
              </div>
            </div>

            <p className='text-xs font-semibold uppercase tracking-[0.13em] text-[#70809a]'>
              Tourist view: {districtFilteredHotels.length} hotel options
            </p>
          </div>

          {quickDistricts.length > 0 ? (
            <div className='mt-3 flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => setSelectedDistrict('All districts')}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  selectedDistrict === 'All districts'
                    ? 'border-[#aebee3] bg-[#edf2ff] text-[#2f4a86]'
                    : 'border-[#d3ddef] bg-white text-[#5c6f8d] hover:bg-[#f6f9ff]',
                ].join(' ')}
              >
                All districts
              </button>
              {quickDistricts.map((district) => (
                <button
                  key={district}
                  type='button'
                  onClick={() => setSelectedDistrict(district)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    selectedDistrict === district
                      ? 'border-[#aebee3] bg-[#edf2ff] text-[#2f4a86]'
                      : 'border-[#d3ddef] bg-white text-[#5c6f8d] hover:bg-[#f6f9ff]',
                  ].join(' ')}
                >
                  {district}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className='flex items-center justify-between gap-3'>
          <p className='text-sm font-semibold text-[#1f2d49]'>
            {activeTab === 'recommendations' ? 'Top ranked hotels' : 'Search results'}
          </p>
          <p className='text-xs text-[#73839e]'>
            {loadingState ? 'Loading data...' : `${districtFilteredHotels.length} results available`}
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

        <motion.div
          layout
          className={[
            'mt-4 grid gap-3',
            viewMode === 'grid' ? 'xl:grid-cols-2' : 'grid-cols-1',
          ].join(' ')}
        >
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

          {!loadingState && districtFilteredHotels.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-[#d9e2ef] bg-[#f7f9fd] px-5 py-10 text-center'>
              <p className='text-base font-semibold text-[#1f2d49]'>No hotels found</p>
              <p className='mt-1 text-sm text-[#64758f]'>Try a different district or switch to all districts.</p>
            </div>
          ) : null}

          {districtFilteredHotels.map((hotel, hotelIndex) => {
            const hotelId = hotel.hotelId || hotel.hotelId?._id || hotel._id
            const isSelected = String(selectedHotelId) === String(hotelId)
            const rating = hotel.feedbackRating ?? hotel.feedbackSummary?.averageRating ?? 0
            const reviewCount = hotel.reviewCount ?? hotel.feedbackSummary?.reviewCount ?? 0
            const trustScore = hotel.trustScore ?? hotel.certificate?.trustScore ?? 0
            const score = hotel.combinedScore ?? hotel.certificate?.trustScore ?? 0
            const trustTone = getTrustTone(Number(trustScore || 0))
            const trustProgress = Math.max(0, Math.min(100, Number(trustScore || 0)))

            return (
              <motion.button
                key={String(hotelId)}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                type='button'
                onClick={() => onSelectHotel(hotelId, activeTab)}
                className={[
                  'rounded-3xl border p-4 text-left transition',
                  isSelected
                    ? 'border-(--brand-700) bg-[#f6f8ff] shadow-[0_20px_40px_-34px_rgba(39,54,122,0.7)]'
                    : 'border-[#dce4f1] bg-white hover:border-[#bfcbea] hover:bg-[#fbfcff] hover:shadow-[0_18px_35px_-30px_rgba(20,31,54,0.35)]',
                ].join(' ')}
              >
                <div className={['grid gap-4', viewMode === 'grid' ? 'lg:grid-cols-[240px_minmax(0,1fr)]' : 'lg:grid-cols-[300px_minmax(0,1fr)]'].join(' ')}>
                  <div className='relative overflow-hidden rounded-2xl border border-[#dbe4f1]'>
                    <img
                      src={getMockImage(hotelIndex)}
                      alt='Mock hotel preview'
                      className='h-44 w-full object-cover'
                      loading='lazy'
                    />
                    <div className='absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(17,27,48,0.72))] p-3'>
                      <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80'>Image preview</p>
                      <p className='text-sm font-semibold text-white'>Mock image, integration pending</p>
                    </div>
                  </div>

                  <div>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h3 className='text-lg font-semibold text-[#16243d]'>
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
                        <p className='mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6c7f9b]'>District: {hotel.district}</p>
                      </div>

                      <div className={`rounded-2xl border px-3 py-2 text-right text-xs font-semibold ${trustTone.badge}`}>
                        {activeTab === 'recommendations' ? `Rank #${hotel.rank}` : trustTone.label}
                      </div>
                    </div>

                    <div className='mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]'>
                      <div className={`rounded-2xl border bg-white p-3 ring-1 ${trustTone.ring}`}>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Trust score</p>
                          <BadgeCheck size={15} className='text-[#4a5fa8]' />
                        </div>
                        <p className='mt-1 text-2xl font-bold text-[#1d2b4a]'>{formatScore(trustScore)}</p>
                        <div className='mt-2 h-2 rounded-full bg-[#e7eef9]'>
                          <div className={`h-2 rounded-full ${trustTone.bar}`} style={{ width: `${trustProgress}%` }} />
                        </div>
                      </div>

                      <div className='rounded-2xl bg-[#f8faff] px-3 py-3'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Guest rating</p>
                        <p className='mt-1 text-base font-semibold text-[#1f2d49]'>{formatScore(rating)}/5</p>
                      </div>

                      <div className='rounded-2xl bg-[#f8faff] px-3 py-3'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d8ca7]'>Reviews</p>
                        <p className='mt-1 text-base font-semibold text-[#1f2d49]'>{reviewCount}</p>
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-between text-sm text-[#5e6e88]'>
                      <span>{activeTab === 'recommendations' ? `Composite score ${formatScore(score)}` : formatEmail(hotel)}</span>
                      <span className='inline-flex items-center gap-1 font-semibold text-[#31477a]'>
                        View details
                        <ArrowRight size={15} className='text-[#7b8aad]' />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default HotelListSection