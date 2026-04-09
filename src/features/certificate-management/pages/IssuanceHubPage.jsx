import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  Layers3,
  ListFilter,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useAuth } from '../../auth/hooks/useAuth'
import {
  clearCertificateManagementMessages,
  fetchIssuanceHubData,
  issueCertificateAction,
} from '../store/certificateManagementSlice'
import {
  selectCertificateManagementActionError,
  selectCertificateManagementActionStatus,
  selectCertificateManagementActionSuccess,
  selectCertificateManagementError,
  selectIssuanceHubError,
  selectIssuanceHubHotels,
  selectIssuanceHubStatus,
  selectIssuanceHubSummary,
} from '../store/certificateManagementSelectors'

const CARD_BASE =
  'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.1)]'

const BUSINESS_TYPE_OPTIONS = ['ALL', 'Hotel', 'Resort', 'Lodge', 'Guesthouse']
const READINESS_OPTIONS = ['ALL', 'READY', 'CERTIFIED']
const SORT_OPTIONS = ['NEWEST', 'NAME_ASC', 'NAME_DESC']

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString()
}

function IssuanceHubPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
  const preselectedHotelId = searchParams.get('hotelId') || ''

  const issuanceHubSummary = useAppSelector(selectIssuanceHubSummary)
  const issuanceHubHotels = useAppSelector(selectIssuanceHubHotels)
  const issuanceHubStatus = useAppSelector(selectIssuanceHubStatus)
  const issuanceHubError = useAppSelector(selectIssuanceHubError)
  const listError = useAppSelector(selectCertificateManagementError)
  const actionError = useAppSelector(selectCertificateManagementActionError)
  const actionSuccess = useAppSelector(selectCertificateManagementActionSuccess)
  const actionStatus = useAppSelector(selectCertificateManagementActionStatus)

  const isLoading = issuanceHubStatus === 'loading' || issuanceHubStatus === 'idle'
  const isSubmitting = actionStatus === 'loading'

  const [searchQuery, setSearchQuery] = useState('')
  const [businessTypeFilter, setBusinessTypeFilter] = useState('ALL')
  const [readinessFilter, setReadinessFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [selectedHotelId, setSelectedHotelId] = useState(preselectedHotelId)
  const [validityPeriodInMonths, setValidityPeriodInMonths] = useState(12)
  const [createdCertificateNumber, setCreatedCertificateNumber] = useState('')

  useEffect(() => {
    if (issuanceHubStatus === 'idle') {
      dispatch(fetchIssuanceHubData())
    }

    return () => {
      dispatch(clearCertificateManagementMessages())
    }
  }, [dispatch, issuanceHubStatus])

  const effectiveSelectedHotelId = useMemo(() => {
    if (!issuanceHubHotels.length) {
      return ''
    }

    const hasCurrentSelection = issuanceHubHotels.some((item) => item.hotelId === selectedHotelId)
    if (hasCurrentSelection) {
      return selectedHotelId
    }

    if (preselectedHotelId) {
      const hasPreselected = issuanceHubHotels.some((item) => item.hotelId === preselectedHotelId)
      if (hasPreselected) {
        return preselectedHotelId
      }
    }

    const firstReadyHotel = issuanceHubHotels.find((item) => !item.alreadyCertified)
    return (firstReadyHotel || issuanceHubHotels[0]).hotelId
  }, [issuanceHubHotels, preselectedHotelId, selectedHotelId])

  const filteredHotels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    let rows = issuanceHubHotels.filter((item) => {
      if (businessTypeFilter !== 'ALL') {
        const hotelType = item?.hotel?.businessInfo?.businessType || ''
        if (hotelType !== businessTypeFilter) {
          return false
        }
      }

      if (readinessFilter === 'READY' && item.alreadyCertified) {
        return false
      }

      if (readinessFilter === 'CERTIFIED' && !item.alreadyCertified) {
        return false
      }

      if (!query) {
        return true
      }

      const searchable = [
        item?.hotel?.businessInfo?.name,
        item?.hotel?.businessInfo?.businessType,
        item?.hotel?.businessInfo?.contact?.email,
        item?.hotel?.businessInfo?.contact?.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(query)
    })

    rows = [...rows].sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        const aName = String(a?.hotel?.businessInfo?.name || '').toLowerCase()
        const bName = String(b?.hotel?.businessInfo?.name || '').toLowerCase()
        return aName.localeCompare(bName)
      }

      if (sortBy === 'NAME_DESC') {
        const aName = String(a?.hotel?.businessInfo?.name || '').toLowerCase()
        const bName = String(b?.hotel?.businessInfo?.name || '').toLowerCase()
        return bName.localeCompare(aName)
      }

      const aCreated = new Date(a?.createdAt || 0).getTime()
      const bCreated = new Date(b?.createdAt || 0).getTime()
      return bCreated - aCreated
    })

    return rows
  }, [businessTypeFilter, issuanceHubHotels, readinessFilter, searchQuery, sortBy])

  const selectedHotel = useMemo(
    () => issuanceHubHotels.find((item) => item.hotelId === effectiveSelectedHotelId) || null,
    [effectiveSelectedHotelId, issuanceHubHotels],
  )

  const summary = useMemo(() => {
    const readyToIssueFallback = issuanceHubHotels.filter((item) => !item.alreadyCertified).length
    const alreadyCertifiedFallback = issuanceHubHotels.filter((item) => item.alreadyCertified).length
    const recentlyAddedFallback = issuanceHubHotels.filter((item) => Boolean(item?.createdAt)).length

    return {
      readyToIssue: toNumber(issuanceHubSummary?.readyToIssue ?? readyToIssueFallback),
      alreadyCertifiedCount: toNumber(issuanceHubSummary?.alreadyCertifiedCount ?? alreadyCertifiedFallback),
      recentlyAddedCount: toNumber(issuanceHubSummary?.recentlyAddedCount ?? recentlyAddedFallback),
      averageActiveValidityMonths: toNumber(issuanceHubSummary?.averageActiveValidityMonths ?? 0),
      businessTypeBreakdown: Array.isArray(issuanceHubSummary?.businessTypeBreakdown)
        ? issuanceHubSummary.businessTypeBreakdown
        : [],
    }
  }, [issuanceHubHotels, issuanceHubSummary])

  async function handleIssueCertificate(event) {
    event.preventDefault()

    if (!isAdmin || !selectedHotel || selectedHotel.alreadyCertified) {
      return
    }

    dispatch(clearCertificateManagementMessages())
    setCreatedCertificateNumber('')

    try {
      const response = await dispatch(
        issueCertificateAction({
          hotelId: selectedHotel.hotelId,
          validityPeriodInMonths: Number(validityPeriodInMonths),
        }),
      ).unwrap()

      const certificateNumber = response?.data?.certificateNumber || ''
      setCreatedCertificateNumber(certificateNumber)

      await dispatch(fetchIssuanceHubData())
    } catch {
      // actionError in store handles message display
    }
  }

  return (
    <section className='space-y-6 rounded-[20px] bg-[#f8fafc] p-4 sm:p-5 xl:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Issuance Hub</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Unified flow to review readiness and issue certificates from one modern workspace.
          </p>
        </div>
        <div className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600'>
          <Sparkles className='h-3.5 w-3.5 text-indigo-600' />
          {isAdmin ? 'Admin mode: issue actions enabled' : 'Auditor mode: read-only issuance'}
        </div>
      </div>

      {listError || issuanceHubError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>
          {issuanceHubError || listError}
        </p>
      ) : null}

      {actionError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{actionError}</p>
      ) : null}

      {actionSuccess ? (
        <div className='rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
          <p>{actionSuccess}</p>
          {createdCertificateNumber ? (
            <Link
              to={`../certificates/${encodeURIComponent(createdCertificateNumber)}`}
              className='mt-2 inline-flex font-semibold text-emerald-800 underline'
            >
              View {createdCertificateNumber}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <article className={`${CARD_BASE} border-[#bbf7d0] bg-gradient-to-br from-[#ecfdf5] via-white to-[#f8fafc]`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Ready To Issue</span>
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{summary.readyToIssue}</p>
          <p className='mt-1 text-xs text-slate-500'>Hotels currently eligible with no active certificate.</p>
        </article>

        <article className={`${CARD_BASE} border-[#c7d2fe] bg-gradient-to-br from-[#eef2ff] via-white to-[#f8fafc]`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Already Certified</span>
            <ShieldCheck className='h-4 w-4 text-indigo-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{summary.alreadyCertifiedCount}</p>
          <p className='mt-1 text-xs text-slate-500'>Eligible hotels with an active certificate on record.</p>
        </article>

        <article className={`${CARD_BASE} border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-white to-[#f8fafc]`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Recently Added</span>
            <Clock3 className='h-4 w-4 text-amber-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{summary.recentlyAddedCount}</p>
          <p className='mt-1 text-xs text-slate-500'>Eligible entries created within the last 30 days.</p>
        </article>

        <article className={`${CARD_BASE} border-[#bae6fd] bg-gradient-to-br from-[#ecfeff] via-white to-[#f8fafc]`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Avg Active Validity</span>
            <Layers3 className='h-4 w-4 text-cyan-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{summary.averageActiveValidityMonths} mo</p>
          <p className='mt-1 text-xs text-slate-500'>Average active certificate validity span in this pipeline.</p>
        </article>
      </div>

      <div className='grid gap-6 xl:grid-cols-12'>
        <article className={`${CARD_BASE} xl:col-span-8`}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>Eligible Hotels Pipeline</h3>
              <p className='text-sm text-slate-500'>Click a row to preview and issue from the side panel.</p>
            </div>
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <label className='text-sm font-medium text-slate-700'>
              Search
              <div className='relative mt-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder='Hotel, email, address...'
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                />
              </div>
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Business Type
              <div className='relative mt-1'>
                <Filter className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <select
                  value={businessTypeFilter}
                  onChange={(event) => setBusinessTypeFilter(event.target.value)}
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                >
                  {BUSINESS_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type === 'ALL' ? 'All types' : type}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Readiness
              <div className='relative mt-1'>
                <ListFilter className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <select
                  value={readinessFilter}
                  onChange={(event) => setReadinessFilter(event.target.value)}
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                >
                  {READINESS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'ALL' ? 'All' : option === 'READY' ? 'Ready To Issue' : 'Already Certified'}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Sort
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className='mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm'
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'NEWEST'
                      ? 'Newest'
                      : option === 'NAME_ASC'
                        ? 'Name (A-Z)'
                        : 'Name (Z-A)'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className='mt-4 overflow-hidden rounded-xl border border-slate-200'>
            {isLoading ? (
              <p className='bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading issuance pipeline...</p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-slate-50 text-left text-xs uppercase text-slate-500'>
                    <tr>
                      <th className='px-3 py-2'>Hotel</th>
                      <th className='px-3 py-2'>Contact</th>
                      <th className='px-3 py-2'>Readiness</th>
                      <th className='px-3 py-2'>Active Certificate</th>
                      <th className='px-3 py-2'>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotels.map((item, index) => {
                      const isSelected = item.hotelId === effectiveSelectedHotelId
                      return (
                        <tr
                          key={item.hotelRequestId || item.hotelId}
                          onClick={() => setSelectedHotelId(item.hotelId)}
                          className={[
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-indigo-50/70' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                            'hover:bg-indigo-50/50',
                          ].join(' ')}
                        >
                          <td className='px-3 py-2'>
                            <p className='font-semibold text-slate-900'>{item.hotel?.businessInfo?.name || item.hotelId}</p>
                            <p className='text-xs text-slate-500'>{item.hotel?.businessInfo?.businessType || 'Unknown'}</p>
                          </td>
                          <td className='px-3 py-2 text-slate-700'>
                            <p className='flex items-center gap-1 text-xs'>
                              <Mail className='h-3.5 w-3.5 text-slate-400' />
                              {item.hotel?.businessInfo?.contact?.email || 'N/A'}
                            </p>
                            <p className='mt-1 text-xs text-slate-500'>{item.hotel?.businessInfo?.contact?.phone || 'N/A'}</p>
                          </td>
                          <td className='px-3 py-2'>
                            {item.alreadyCertified ? (
                              <span className='rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700'>
                                Certified
                              </span>
                            ) : (
                              <span className='rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'>
                                Ready
                              </span>
                            )}
                          </td>
                          <td className='px-3 py-2 text-xs text-slate-600'>
                            {item.activeCertificate ? (
                              <div>
                                <p className='font-semibold text-slate-800'>{item.activeCertificate.certificateNumber}</p>
                                <p>{item.activeCertificate.level} - Score {toNumber(item.activeCertificate.trustScore)}</p>
                              </div>
                            ) : (
                              <span className='text-slate-400'>None</span>
                            )}
                          </td>
                          <td className='px-3 py-2 text-xs text-slate-600'>{formatDate(item.updatedAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {!filteredHotels.length ? (
                  <p className='px-4 py-5 text-sm text-slate-500'>No hotels match the selected filters.</p>
                ) : null}
              </div>
            )}
          </div>
        </article>

        <article className={`${CARD_BASE} xl:col-span-4`}>
          <h3 className='text-lg font-semibold text-slate-900'>Issue Certificate</h3>
          <p className='mt-1 text-sm text-slate-500'>Review selected hotel and issue in one step.</p>

          {selectedHotel ? (
            <div className='mt-4 space-y-3 text-sm'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='font-semibold text-slate-900'>{selectedHotel.hotel?.businessInfo?.name || selectedHotel.hotelId}</p>
                <p className='mt-1 flex items-center gap-1 text-xs text-slate-600'>
                  <Building2 className='h-3.5 w-3.5 text-slate-400' />
                  {selectedHotel.hotel?.businessInfo?.businessType || 'Unknown type'}
                </p>
                <p className='mt-1 flex items-start gap-1 text-xs text-slate-600'>
                  <MapPin className='mt-0.5 h-3.5 w-3.5 text-slate-400' />
                  <span>{selectedHotel.hotel?.businessInfo?.contact?.address || 'Address not provided'}</span>
                </p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-3'>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Scoring Status</p>
                <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                  <span className='rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700'>
                    Hotel: {selectedHotel.hotelScore?.status || 'N/A'}
                  </span>
                  <span className='rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700'>
                    Audit: {selectedHotel.auditScore?.status || 'N/A'}
                  </span>
                </div>
              </div>

              {selectedHotel.alreadyCertified && selectedHotel.activeCertificate ? (
                <div className='rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800'>
                  <p className='font-semibold'>Active certificate already exists</p>
                  <p className='mt-1'>{selectedHotel.activeCertificate.certificateNumber} - {selectedHotel.activeCertificate.level}</p>
                  <p>Expires: {formatDate(selectedHotel.activeCertificate.expiryDate)}</p>
                </div>
              ) : null}

              {!isAdmin ? (
                <div className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600'>
                  You are in read-only mode. Admin role is required to issue certificates.
                </div>
              ) : null}

              <form className='space-y-3' onSubmit={handleIssueCertificate}>
                <label className='block text-sm font-medium text-slate-700'>
                  Validity period (months)
                  <input
                    type='number'
                    min='1'
                    max='120'
                    value={validityPeriodInMonths}
                    onChange={(event) => setValidityPeriodInMonths(Number(event.target.value))}
                    className='mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm'
                  />
                </label>

                <button
                  type='submit'
                  disabled={
                    !isAdmin ||
                    isSubmitting ||
                    !selectedHotel ||
                    selectedHotel.alreadyCertified ||
                    !validityPeriodInMonths ||
                    validityPeriodInMonths < 1 ||
                    validityPeriodInMonths > 120
                  }
                  className='w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting ? 'Issuing...' : 'Issue certificate'}
                </button>
              </form>
            </div>
          ) : (
            <p className='mt-4 text-sm text-slate-500'>Select a hotel from the table to begin issuance.</p>
          )}

          <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <p className='text-xs uppercase tracking-wide text-slate-500'>Business Type Mix</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {summary.businessTypeBreakdown.length ? (
                summary.businessTypeBreakdown.map((item) => (
                  <span
                    key={`${item.businessType}-${item.count}`}
                    className='rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700'
                  >
                    {item.businessType}: {item.count}
                  </span>
                ))
              ) : (
                <span className='text-xs text-slate-500'>No breakdown data available.</span>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default IssuanceHubPage

