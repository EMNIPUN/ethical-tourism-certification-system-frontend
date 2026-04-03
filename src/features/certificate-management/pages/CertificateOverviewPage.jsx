import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'
import { fetchCertificates, fetchEligibleHotels } from '../store/certificateManagementSlice'
import {
  selectCertificateManagementError,
  selectCertificates,
  selectCertificatesStatus,
  selectEligibleHotels,
  selectEligibleHotelsStatus,
} from '../store/certificateManagementSelectors'

function toDate(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(fromDate, toDateValue) {
  const from = toDate(fromDate)
  const to = toDate(toDateValue)

  if (!from || !to) {
    return null
  }

  const diffMs = to.getTime() - from.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function CertificateOverviewPage() {
  const dispatch = useAppDispatch()
  const certificates = useAppSelector(selectCertificates)
  const eligibleHotels = useAppSelector(selectEligibleHotels)
  const certificatesStatus = useAppSelector(selectCertificatesStatus)
  const eligibleHotelsStatus = useAppSelector(selectEligibleHotelsStatus)
  const errorMessage = useAppSelector(selectCertificateManagementError)
  const isLoading = certificatesStatus === 'loading' || eligibleHotelsStatus === 'loading'

  useEffect(() => {
    if (certificatesStatus === 'idle') {
      dispatch(fetchCertificates(''))
    }

    if (eligibleHotelsStatus === 'idle') {
      dispatch(fetchEligibleHotels())
    }
  }, [certificatesStatus, dispatch, eligibleHotelsStatus])

  const metrics = useMemo(() => {
    const active = certificates.filter((item) => item.status === 'ACTIVE')
    const expired = certificates.filter((item) => item.status === 'EXPIRED').length
    const revoked = certificates.filter((item) => item.status === 'REVOKED').length
    const inactive = certificates.filter((item) => item.status === 'INACTIVE').length
    const readyToIssue = eligibleHotels.filter((item) => !item.alreadyCertified).length

    const now = new Date()
    const expiringSoon = active.filter((item) => {
      const days = daysBetween(now, item.expiryDate)
      return days !== null && days >= 0 && days <= 45
    }).length

    const averageTrust =
      active.length > 0
        ? Math.round(active.reduce((sum, item) => sum + (Number(item.trustScore) || 0), 0) / active.length)
        : 0

    return {
      total: certificates.length,
      active: active.length,
      readyToIssue,
      expiringSoon,
      riskStates: revoked + expired + inactive,
      expired,
      revoked,
      inactive,
      averageTrust,
    }
  }, [certificates, eligibleHotels])

  const latestCertificates = useMemo(() => certificates.slice(0, 8), [certificates])

  const expiringCertificates = useMemo(() => {
    const now = new Date()

    return certificates
      .filter((item) => item.status === 'ACTIVE')
      .map((item) => ({
        ...item,
        daysLeft: daysBetween(now, item.expiryDate),
      }))
      .filter((item) => item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 45)
      .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
      .slice(0, 5)
  }, [certificates])

  const statusBreakdown = useMemo(() => {
    const total = Math.max(1, certificates.length)

    return [
      {
        label: 'Active',
        value: metrics.active,
        percentage: Math.round((metrics.active / total) * 100),
        tone: 'bg-emerald-500',
      },
      {
        label: 'Expired',
        value: metrics.expired,
        percentage: Math.round((metrics.expired / total) * 100),
        tone: 'bg-amber-500',
      },
      {
        label: 'Revoked',
        value: metrics.revoked,
        percentage: Math.round((metrics.revoked / total) * 100),
        tone: 'bg-rose-500',
      },
      {
        label: 'Inactive',
        value: metrics.inactive,
        percentage: Math.round((metrics.inactive / total) * 100),
        tone: 'bg-slate-500',
      },
    ]
  }, [certificates.length, metrics.active, metrics.expired, metrics.inactive, metrics.revoked])

  return (
    <section className='space-y-5'>
      {errorMessage ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{errorMessage}</p>
      ) : null}

      <article className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
      
        <div className='grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5'>
          <article className='rounded-2xl border border-blue-200 bg-blue-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-blue-700'>Total Certificates</p>
            <p className='mt-2 text-3xl font-black text-blue-900'>{metrics.total}</p>
          </article>
          <article className='rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>Active</p>
            <p className='mt-2 text-3xl font-black text-emerald-900'>{metrics.active}</p>
          </article>
          <article className='rounded-2xl border border-amber-200 bg-amber-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Expiring In 45 Days</p>
            <p className='mt-2 text-3xl font-black text-amber-900'>{metrics.expiringSoon}</p>
          </article>
          <article className='rounded-2xl border border-cyan-200 bg-cyan-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>Eligible To Issue</p>
            <p className='mt-2 text-3xl font-black text-cyan-900'>{metrics.readyToIssue}</p>
          </article>
          <article className='rounded-2xl border border-rose-200 bg-rose-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-rose-700'>Risk States</p>
            <p className='mt-2 text-3xl font-black text-rose-900'>{metrics.riskStates}</p>
          </article>
        </div>
      </article>

      <div className='grid gap-5 xl:grid-cols-3'>
        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h3 className='text-lg font-bold text-slate-900'>Latest Certificates</h3>
            <Link to='certificates' className='rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100'>
              Manage all
            </Link>
          </div>

          {isLoading ? (
            <p className='mt-4 rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading overview...</p>
          ) : latestCertificates.length ? (
            <div className='mt-4 overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b border-slate-200 text-left text-xs uppercase text-slate-500'>
                    <th className='px-3 py-2'>Certificate</th>
                    <th className='px-3 py-2'>Hotel</th>
                    <th className='px-3 py-2'>Status</th>
                    <th className='px-3 py-2'>Level</th>
                    <th className='px-3 py-2'>Score</th>
                    <th className='px-3 py-2'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {latestCertificates.map((item) => (
                    <tr key={item._id || item.certificateNumber} className='border-b border-slate-100'>
                      <td className='px-3 py-2 font-semibold text-slate-900'>{item.certificateNumber}</td>
                      <td className='px-3 py-2 text-slate-700'>{item.hotelId?.businessInfo?.name || 'Unknown hotel'}</td>
                      <td className='px-3 py-2'>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className='px-3 py-2'>
                        <LevelBadge level={item.level} />
                      </td>
                      <td className='px-3 py-2 text-slate-700'>{item.trustScore ?? 'N/A'}</td>
                      <td className='px-3 py-2'>
                        <Link
                          to={`certificates/${encodeURIComponent(item.certificateNumber)}`}
                          className='rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className='mt-4 rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>No certificates available yet.</p>
          )}
        </article>

        <article className='space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div>
            <h3 className='text-lg font-bold text-slate-900'>Lifecycle Health</h3>
            <p className='mt-1 text-sm text-slate-600'>Distribution and renewal pressure snapshot.</p>
          </div>

          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Average Active Trust</p>
            <p className='mt-2 text-3xl font-black text-slate-900'>{metrics.averageTrust}</p>
          </div>

          <div className='space-y-3'>
            {statusBreakdown.map((item) => (
              <div key={item.label}>
                <div className='mb-1 flex items-center justify-between text-xs text-slate-600'>
                  <span>{item.label}</span>
                  <span>{item.value} ({item.percentage}%)</span>
                </div>
                <div className='h-2 rounded-full bg-slate-200'>
                  <div className={`h-2 rounded-full ${item.tone}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className='rounded-xl border border-amber-200 bg-amber-50 p-4'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Renewal Watchlist</p>
              <Link to='certificates' className='text-xs font-semibold text-amber-800 underline'>
                Open
              </Link>
            </div>

            {isLoading ? (
              <p className='mt-2 text-xs text-amber-800/80'>Loading...</p>
            ) : expiringCertificates.length ? (
              <ul className='mt-2 space-y-2 text-xs text-amber-900'>
                {expiringCertificates.map((item) => (
                  <li key={item._id || item.certificateNumber} className='rounded-lg bg-white/70 px-2 py-1.5'>
                    <p className='font-semibold'>{item.hotelId?.businessInfo?.name || item.certificateNumber}</p>
                    <p>{item.daysLeft} day(s) left</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='mt-2 text-xs text-amber-800/80'>No active certificates expiring in next 45 days.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default CertificateOverviewPage
