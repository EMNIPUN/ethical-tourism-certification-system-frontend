import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  getCertificateDetails,
  getCertificateTimeline,
  inactivateCertificate,
  renewCertificate,
  revokeCertificate,
  updateCertificateTrustScore,
  updateTrustScore,
} from '../certificateManagementService'
import { useAuth } from '../../common/auth/AuthContext'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'

const TIMELINE_EVENT_OPTIONS = [
  '',
  'CERTIFICATE_ISSUED',
  'TRUST_SCORE_UPDATED',
  'LEVEL_CHANGED',
  'STATUS_CHANGED',
  'CERTIFICATE_RENEWED',
  'CERTIFICATE_REVOKED',
  'CERTIFICATE_EXPIRED',
  'CERTIFICATE_INACTIVATED',
  'AUTO_REVOCATION_TRIGGERED',
  'FEEDBACK_SYNC_APPLIED',
]

function resolveHotelId(certificate) {
  if (!certificate?.hotelId) {
    return ''
  }

  if (typeof certificate.hotelId === 'string') {
    return certificate.hotelId
  }

  return certificate.hotelId._id || ''
}

function formatEventType(eventType) {
  return String(eventType || '')
    .toLowerCase()
    .split('_')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function getEventTone(eventType) {
  if (eventType === 'CERTIFICATE_REVOKED' || eventType === 'AUTO_REVOCATION_TRIGGERED') {
    return {
      dot: 'bg-rose-500',
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
    }
  }

  if (eventType === 'CERTIFICATE_RENEWED' || eventType === 'CERTIFICATE_ISSUED') {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  }

  if (eventType === 'TRUST_SCORE_UPDATED' || eventType === 'LEVEL_CHANGED') {
    return {
      dot: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
    }
  }

  return {
    dot: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  }
}

function renderValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toLocaleString()
  }

  return JSON.stringify(value)
}

function CertificateDetailsPage() {
  const { certificateNumber } = useParams()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/admin/certificate-management')
    ? '/admin/certificate-management'
    : '/certificate-management'
  const { user } = useAuth()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const [certificate, setCertificate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [timeline, setTimeline] = useState([])
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState('')
  const [timelinePage, setTimelinePage] = useState(1)
  const [timelineHasNext, setTimelineHasNext] = useState(false)
  const [timelineTotal, setTimelineTotal] = useState(0)
  const [timelineFilters, setTimelineFilters] = useState({
    eventType: '',
    from: '',
    to: '',
    order: 'desc',
  })

  const [renewMonths, setRenewMonths] = useState(12)
  const [revokeReason, setRevokeReason] = useState('')
  const [inactivateReason, setInactivateReason] = useState('')
  const [scoreChange, setScoreChange] = useState(-5)
  const [scoreReason, setScoreReason] = useState('')
  const [averageRating, setAverageRating] = useState(4.2)
  const [reviewCount, setReviewCount] = useState(20)

  async function loadTimeline(certificateId, { page = 1, append = false, filters = timelineFilters } = {}) {
    if (!certificateId) {
      setTimeline([])
      setTimelinePage(1)
      setTimelineHasNext(false)
      setTimelineTotal(0)
      return
    }

    setIsTimelineLoading(true)
    setTimelineError('')

    try {
      const response = await getCertificateTimeline({
        certificateId,
        page,
        limit: 20,
        order: filters.order || 'desc',
        eventType: filters.eventType ? [filters.eventType] : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      })

      const nextItems = response?.data?.items || []
      const pagination = response?.data?.pagination || {}

      setTimeline((previous) => (append ? [...previous, ...nextItems] : nextItems))
      setTimelinePage(Number(pagination.page) || page)
      setTimelineHasNext(Boolean(pagination.hasNext))
      setTimelineTotal(Number(pagination.total) || nextItems.length)
    } catch (error) {
      setTimelineError(error.message || 'Failed to load activity timeline')
      if (!append) {
        setTimeline([])
      }
    } finally {
      setIsTimelineLoading(false)
    }
  }

  async function loadCertificateAndTimeline(activeFilters = timelineFilters) {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await getCertificateDetails(certificateNumber)
      const cert = response?.data || null
      setCertificate(cert)

      if (cert?._id) {
        await loadTimeline(cert._id, {
          page: 1,
          append: false,
          filters: activeFilters,
        })
      } else {
        setTimeline([])
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load certificate details')
      setCertificate(null)
      setTimeline([])
      setTimelinePage(1)
      setTimelineHasNext(false)
      setTimelineTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificateAndTimeline()
    // loadCertificateAndTimeline uses latest local state and should run when the route ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateNumber])

  const hotelId = useMemo(() => resolveHotelId(certificate), [certificate])

  async function runAction(action, successText) {
    setIsActing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await action()
      setSuccessMessage(successText)
      await loadCertificateAndTimeline(timelineFilters)
    } catch (error) {
      setErrorMessage(error.message || 'Action failed')
    } finally {
      setIsActing(false)
    }
  }

  async function applyTimelineFilters(event) {
    event.preventDefault()

    if (!certificate?._id) {
      return
    }

    await loadTimeline(certificate._id, {
      page: 1,
      append: false,
      filters: timelineFilters,
    })
  }

  async function loadMoreTimeline() {
    if (!certificate?._id || !timelineHasNext || isTimelineLoading) {
      return
    }

    await loadTimeline(certificate._id, {
      page: timelinePage + 1,
      append: true,
      filters: timelineFilters,
    })
  }

  function updateTimelineFilter(name, value) {
    setTimelineFilters((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-2xl font-black text-slate-900'>Certificate Details</h2>
        <Link to={`${basePath}/certificates`} className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'>
          Back to list
        </Link>
      </div>

      {errorMessage ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700'>{successMessage}</p>
      ) : null}

      {isLoading ? (
        <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-slate-500'>Loading certificate details...</p>
        </article>
      ) : certificate ? (
        <>
          <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='grid gap-3 text-sm text-slate-700 md:grid-cols-2'>
              <p><span className='font-semibold'>Certificate Number:</span> {certificate.certificateNumber}</p>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>Status:</span> <StatusBadge status={certificate.status} />
              </p>
              <p><span className='font-semibold'>Trust Score:</span> {certificate.trustScore ?? 'N/A'}</p>
              <p className='flex items-center gap-2'>
                <span className='font-semibold'>Level:</span> <LevelBadge level={certificate.level} />
              </p>
              <p><span className='font-semibold'>Issued Date:</span> {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleString() : 'N/A'}</p>
              <p><span className='font-semibold'>Expiry Date:</span> {certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleString() : 'N/A'}</p>
              <p><span className='font-semibold'>Hotel Name:</span> {certificate.hotelId?.businessInfo?.name || 'N/A'}</p>
              <p><span className='font-semibold'>Hotel ID:</span> {hotelId || 'N/A'}</p>
            </div>
          </article>

          <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h3 className='text-lg font-bold text-slate-900'>Activity Timeline</h3>
              <p className='text-xs text-slate-500'>
                {timelineTotal ? `Total events: ${timelineTotal}` : 'No events'}
              </p>
            </div>

            <form className='mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5' onSubmit={applyTimelineFilters}>
              <label className='text-xs font-semibold uppercase tracking-wide text-slate-600'>
                Event Type
                <select
                  value={timelineFilters.eventType}
                  onChange={(event) => updateTimelineFilter('eventType', event.target.value)}
                  className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal normal-case tracking-normal text-slate-700'
                >
                  {TIMELINE_EVENT_OPTIONS.map((eventType) => (
                    <option key={eventType || 'ALL'} value={eventType}>
                      {eventType ? formatEventType(eventType) : 'All events'}
                    </option>
                  ))}
                </select>
              </label>

              <label className='text-xs font-semibold uppercase tracking-wide text-slate-600'>
                From
                <input
                  type='date'
                  value={timelineFilters.from}
                  onChange={(event) => updateTimelineFilter('from', event.target.value)}
                  className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal normal-case tracking-normal text-slate-700'
                />
              </label>

              <label className='text-xs font-semibold uppercase tracking-wide text-slate-600'>
                To
                <input
                  type='date'
                  value={timelineFilters.to}
                  onChange={(event) => updateTimelineFilter('to', event.target.value)}
                  className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal normal-case tracking-normal text-slate-700'
                />
              </label>

              <label className='text-xs font-semibold uppercase tracking-wide text-slate-600'>
                Order
                <select
                  value={timelineFilters.order}
                  onChange={(event) => updateTimelineFilter('order', event.target.value)}
                  className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm font-normal normal-case tracking-normal text-slate-700'
                >
                  <option value='desc'>Newest first</option>
                  <option value='asc'>Oldest first</option>
                </select>
              </label>

              <div className='flex items-end'>
                <button
                  type='submit'
                  disabled={isTimelineLoading}
                  className='w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {isTimelineLoading ? 'Loading...' : 'Apply Filters'}
                </button>
              </div>
            </form>

            {timelineError ? (
              <p className='mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{timelineError}</p>
            ) : null}

            {isTimelineLoading && !timeline.length ? (
              <p className='mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500'>Loading activity timeline...</p>
            ) : timeline.length ? (
              <>
                <ol className='mt-5 space-y-5'>
                  {timeline.map((event, index) => {
                    const tone = getEventTone(event.eventType)
                    const changes = event?.changes && typeof event.changes === 'object' ? Object.entries(event.changes) : []

                    return (
                      <li key={event._id || `${event.eventType}-${index}`} className='relative pl-8'>
                        {index < timeline.length - 1 ? (
                          <span className='absolute left-2.75 top-6 h-[calc(100%+0.75rem)] w-px bg-slate-200' aria-hidden='true' />
                        ) : null}

                        <span className={`absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${tone.dot}`} aria-hidden='true'>
                          <span className='h-2 w-2 rounded-full bg-white' />
                        </span>

                        <div className='rounded-xl border border-slate-200 bg-slate-50/70 p-4'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone.badge}`}>
                              {formatEventType(event.eventType)}
                            </span>
                            <span className='text-xs text-slate-500'>
                              {event.eventTime ? new Date(event.eventTime).toLocaleString() : 'Unknown time'}
                            </span>
                          </div>

                          <p className='mt-2 text-sm text-slate-800'>{event.summary || 'No summary provided.'}</p>

                          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500'>
                            <span>Source: {event.source || 'N/A'}</span>
                            <span>Actor: {event.actorType || 'N/A'}</span>
                            <span>Actor ID: {event.actorId || 'SYSTEM'}</span>
                          </div>

                          {changes.length ? (
                            <div className='mt-3 rounded-lg border border-slate-200 bg-white p-3'>
                              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Changes</p>
                              <ul className='mt-2 space-y-1 text-xs text-slate-700'>
                                {changes.map(([field, diff]) => (
                                  <li key={field}>
                                    <span className='font-semibold'>{field}:</span>{' '}
                                    <span className='text-slate-500'>{renderValue(diff?.before)}</span>
                                    {' -> '}
                                    <span>{renderValue(diff?.after)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ol>

                {timelineHasNext ? (
                  <div className='mt-4'>
                    <button
                      type='button'
                      onClick={loadMoreTimeline}
                      disabled={isTimelineLoading}
                      className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {isTimelineLoading ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className='mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500'>
                No timeline events found for the current filters.
              </p>
            )}
          </article>

          {isAdmin ? (
            <div className='grid gap-4 xl:grid-cols-2'>
              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-slate-900'>Renew Certificate</h3>
                <label className='mt-3 block text-sm font-medium text-slate-700'>
                  Validity Period (months)
                  <input
                    type='number'
                    min='1'
                    max='120'
                    value={renewMonths}
                    onChange={(event) => setRenewMonths(Number(event.target.value))}
                    className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                  />
                </label>
                <button
                  type='button'
                  disabled={isActing}
                  onClick={() => runAction(() => renewCertificate({ certificateId: certificate._id, validityPeriodInMonths: renewMonths }), 'Certificate renewed successfully.')}
                  className='mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60'
                >
                  Renew
                </button>
              </article>

              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-slate-900'>Revoke Certificate</h3>
                <textarea
                  value={revokeReason}
                  onChange={(event) => setRevokeReason(event.target.value)}
                  rows={3}
                  placeholder='Reason for revocation'
                  className='mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                />
                <button
                  type='button'
                  disabled={isActing || !revokeReason.trim()}
                  onClick={() => runAction(() => revokeCertificate({ certificateId: certificate._id, reason: revokeReason.trim() }), 'Certificate revoked successfully.')}
                  className='mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60'
                >
                  Revoke
                </button>
              </article>

              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-slate-900'>Inactivate Certificate</h3>
                <textarea
                  value={inactivateReason}
                  onChange={(event) => setInactivateReason(event.target.value)}
                  rows={3}
                  placeholder='Reason for inactivation'
                  className='mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                />
                <button
                  type='button'
                  disabled={isActing || !inactivateReason.trim()}
                  onClick={() => runAction(() => inactivateCertificate({ certificateId: certificate._id, reason: inactivateReason.trim() }), 'Certificate inactivated successfully.')}
                  className='mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60'
                >
                  Inactivate
                </button>
              </article>

              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-slate-900'>Update Trust Score (Manual)</h3>
                <label className='mt-3 block text-sm font-medium text-slate-700'>
                  Score Change
                  <input
                    type='number'
                    value={scoreChange}
                    onChange={(event) => setScoreChange(Number(event.target.value))}
                    className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                  />
                </label>
                <textarea
                  value={scoreReason}
                  onChange={(event) => setScoreReason(event.target.value)}
                  rows={3}
                  placeholder='Reason for trust score change'
                  className='mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                />
                <button
                  type='button'
                  disabled={isActing || !scoreReason.trim()}
                  onClick={() => runAction(() => updateTrustScore({ certificateId: certificate._id, scoreChange, reason: scoreReason.trim() }), 'Trust score updated successfully.')}
                  className='mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60'
                >
                  Update Trust Score
                </button>
              </article>

              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2'>
                <h3 className='text-lg font-bold text-slate-900'>Recalculate Trust From Reviews</h3>
                <div className='mt-3 grid gap-3 md:grid-cols-2'>
                  <label className='block text-sm font-medium text-slate-700'>
                    Average Rating (0-5)
                    <input
                      type='number'
                      min='0'
                      max='5'
                      step='0.1'
                      value={averageRating}
                      onChange={(event) => setAverageRating(Number(event.target.value))}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                  <label className='block text-sm font-medium text-slate-700'>
                    Review Count
                    <input
                      type='number'
                      min='0'
                      value={reviewCount}
                      onChange={(event) => setReviewCount(Number(event.target.value))}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                </div>
                <button
                  type='button'
                  disabled={isActing || !hotelId}
                  onClick={() => runAction(() => updateCertificateTrustScore({ hotelId, averageRating, reviewCount }), 'Trust score recalculated successfully.')}
                  className='mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60'
                >
                  Recalculate Trust Score
                </button>
              </article>
            </div>
          ) : (
            <p className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700'>
              You can view details, but lifecycle actions are restricted to admins.
            </p>
          )}
        </>
      ) : (
        <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-slate-500'>Certificate not found.</p>
        </article>
      )}
    </section>
  )
}

export default CertificateDetailsPage
