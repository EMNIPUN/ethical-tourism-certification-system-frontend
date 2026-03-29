import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getCertificateDetails,
  inactivateCertificate,
  renewCertificate,
  revokeCertificate,
  updateCertificateTrustScore,
  updateTrustScore,
} from '../certificateManagementService'
import { useAuth } from '../../common/auth/AuthContext'

function resolveHotelId(certificate) {
  if (!certificate?.hotelId) {
    return ''
  }

  if (typeof certificate.hotelId === 'string') {
    return certificate.hotelId
  }

  return certificate.hotelId._id || ''
}

function CertificateDetailsPage() {
  const { certificateNumber } = useParams()
  const { user } = useAuth()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const [certificate, setCertificate] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [renewMonths, setRenewMonths] = useState(12)
  const [revokeReason, setRevokeReason] = useState('')
  const [inactivateReason, setInactivateReason] = useState('')
  const [scoreChange, setScoreChange] = useState(-5)
  const [scoreReason, setScoreReason] = useState('')
  const [averageRating, setAverageRating] = useState(4.2)
  const [reviewCount, setReviewCount] = useState(20)

  async function loadCertificate() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await getCertificateDetails(certificateNumber)
      setCertificate(response?.data || null)
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load certificate details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCertificate()
  }, [certificateNumber])

  const hotelId = useMemo(() => resolveHotelId(certificate), [certificate])

  async function runAction(action, successText) {
    setIsActing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await action()
      setSuccessMessage(successText)
      await loadCertificate()
    } catch (error) {
      setErrorMessage(error.message || 'Action failed')
    } finally {
      setIsActing(false)
    }
  }

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-2xl font-black text-slate-900'>Certificate Details</h2>
        <Link to='../certificates' className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'>
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
              <p><span className='font-semibold'>Status:</span> {certificate.status}</p>
              <p><span className='font-semibold'>Trust Score:</span> {certificate.trustScore ?? 'N/A'}</p>
              <p><span className='font-semibold'>Level:</span> {certificate.level || 'N/A'}</p>
              <p><span className='font-semibold'>Issued Date:</span> {certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleString() : 'N/A'}</p>
              <p><span className='font-semibold'>Expiry Date:</span> {certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleString() : 'N/A'}</p>
              <p><span className='font-semibold'>Hotel Name:</span> {certificate.hotelId?.businessInfo?.name || 'N/A'}</p>
              <p><span className='font-semibold'>Hotel ID:</span> {hotelId || 'N/A'}</p>
            </div>
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
