import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getCertificates,
  inactivateCertificate,
  renewCertificate,
  revokeCertificate,
} from '../certificateManagementService'
import { useAuth } from '../../common/auth/AuthContext'

function CertificatesListPage() {
  const { user } = useAuth()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const [statusFilter, setStatusFilter] = useState('')
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadCertificates(filter = statusFilter) {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await getCertificates(filter)
      setCertificates(response?.data || [])
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load certificates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificates(statusFilter)
  }, [statusFilter])

  const groupedCounts = useMemo(() => {
    return {
      ACTIVE: certificates.filter((item) => item.status === 'ACTIVE').length,
      EXPIRED: certificates.filter((item) => item.status === 'EXPIRED').length,
      REVOKED: certificates.filter((item) => item.status === 'REVOKED').length,
      INACTIVE: certificates.filter((item) => item.status === 'INACTIVE').length,
    }
  }, [certificates])

  async function handleRenew(certificateId) {
    const entered = window.prompt('Enter validity period in months (1-120)', '12')

    if (!entered) {
      return
    }

    const validityPeriodInMonths = Number(entered)

    if (!validityPeriodInMonths || validityPeriodInMonths < 1 || validityPeriodInMonths > 120) {
      setErrorMessage('Validity period must be between 1 and 120.')
      return
    }

    setIsActing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await renewCertificate({ certificateId, validityPeriodInMonths })
      setSuccessMessage('Certificate renewed successfully.')
      await loadCertificates(statusFilter)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to renew certificate')
    } finally {
      setIsActing(false)
    }
  }

  async function handleRevoke(certificateId) {
    const reason = window.prompt('Enter revoke reason')

    if (!reason?.trim()) {
      return
    }

    setIsActing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await revokeCertificate({ certificateId, reason: reason.trim() })
      setSuccessMessage('Certificate revoked successfully.')
      await loadCertificates(statusFilter)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to revoke certificate')
    } finally {
      setIsActing(false)
    }
  }

  async function handleInactivate(certificateId) {
    const reason = window.prompt('Enter inactivate reason')

    if (!reason?.trim()) {
      return
    }

    setIsActing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await inactivateCertificate({ certificateId, reason: reason.trim() })
      setSuccessMessage('Certificate inactivated successfully.')
      await loadCertificates(statusFilter)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to inactivate certificate')
    } finally {
      setIsActing(false)
    }
  }

  return (
    <section className='space-y-4'>
      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-xl font-bold text-slate-900'>Manage Certificates</h2>
            <p className='mt-1 text-sm text-slate-600'>Track statuses and perform lifecycle actions.</p>
          </div>

          <label className='text-sm font-medium text-slate-700'>
            Filter by status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className='mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
            >
              <option value=''>All</option>
              <option value='ACTIVE'>ACTIVE</option>
              <option value='EXPIRED'>EXPIRED</option>
              <option value='REVOKED'>REVOKED</option>
              <option value='INACTIVE'>INACTIVE</option>
            </select>
          </label>
        </div>

        <div className='mt-4 grid gap-2 sm:grid-cols-4'>
          {Object.entries(groupedCounts).map(([status, count]) => (
            <p key={status} className='rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              <span className='font-semibold'>{status}:</span> {count}
            </p>
          ))}
        </div>
      </article>

      {errorMessage ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className='rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700'>{successMessage}</p>
      ) : null}

      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        {isLoading ? (
          <p className='rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading certificates...</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-left text-xs uppercase text-slate-500'>
                  <th className='px-3 py-2'>Certificate</th>
                  <th className='px-3 py-2'>Hotel</th>
                  <th className='px-3 py-2'>Status</th>
                  <th className='px-3 py-2'>Trust</th>
                  <th className='px-3 py-2'>Expiry</th>
                  <th className='px-3 py-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((item) => (
                  <tr key={item._id || item.certificateNumber} className='border-b border-slate-100'>
                    <td className='px-3 py-2 font-semibold text-slate-900'>{item.certificateNumber}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.hotelId?.businessInfo?.name || 'Unknown hotel'}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.status}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.trustScore ?? 'N/A'}</td>
                    <td className='px-3 py-2 text-slate-700'>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-wrap gap-2'>
                        <Link
                          to={`./${encodeURIComponent(item.certificateNumber)}`}
                          className='rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'
                        >
                          View
                        </Link>

                        {isAdmin ? (
                          <>
                            <button
                              type='button'
                              onClick={() => handleRenew(item._id)}
                              disabled={isActing}
                              className='rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60'
                            >
                              Renew
                            </button>
                            <button
                              type='button'
                              onClick={() => handleRevoke(item._id)}
                              disabled={isActing}
                              className='rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60'
                            >
                              Revoke
                            </button>
                            <button
                              type='button'
                              onClick={() => handleInactivate(item._id)}
                              disabled={isActing}
                              className='rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60'
                            >
                              Inactivate
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!certificates.length ? (
              <p className='px-3 py-4 text-sm text-slate-500'>No certificates found for this filter.</p>
            ) : null}
          </div>
        )}
      </article>
    </section>
  )
}

export default CertificatesListPage
