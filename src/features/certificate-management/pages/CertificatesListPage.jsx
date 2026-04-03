import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useAuth } from '../../auth/hooks/useAuth'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'
import LifecycleActionModal from '../components/LifecycleActionModal'
import {
  clearCertificateManagementMessages,
  fetchCertificates,
  inactivateCertificateAction,
  renewCertificateAction,
  revokeCertificateAction,
  setCertificateStatusFilter,
} from '../store/certificateManagementSlice'
import {
  selectCertificateManagementActionError,
  selectCertificateManagementActionStatus,
  selectCertificateManagementActionSuccess,
  selectCertificateManagementError,
  selectCertificates,
  selectCertificatesStatus,
  selectCertificateStatusFilter,
} from '../store/certificateManagementSelectors'

const ACTION_TYPES = {
  RENEW: 'RENEW',
  REVOKE: 'REVOKE',
  INACTIVATE: 'INACTIVATE',
}

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED', 'INACTIVE']

function getHotelName(item) {
  return item?.hotelId?.businessInfo?.name || 'Unknown hotel'
}

function getActionDefaults(type) {
  if (type === ACTION_TYPES.RENEW) {
    return {
      validityPeriodInMonths: 12,
      reason: '',
    }
  }

  return {
    validityPeriodInMonths: 12,
    reason: '',
  }
}

function getActionMeta(type) {
  if (type === ACTION_TYPES.RENEW) {
    return {
      title: 'Renew Certificate',
      description: 'Extend certificate validity period in months.',
      confirmLabel: 'Renew certificate',
    }
  }

  if (type === ACTION_TYPES.REVOKE) {
    return {
      title: 'Revoke Certificate',
      description: 'This action sets status to REVOKED and trust score to 0.',
      confirmLabel: 'Revoke certificate',
    }
  }

  return {
    title: 'Inactivate Certificate',
    description: 'This is a soft-delete lifecycle action (status becomes INACTIVE).',
    confirmLabel: 'Inactivate certificate',
  }
}

function isActionDisabled(type, item) {
  if (type === ACTION_TYPES.RENEW) {
    return item.status === 'REVOKED'
  }

  if (type === ACTION_TYPES.REVOKE) {
    return item.status === 'REVOKED'
  }

  if (type === ACTION_TYPES.INACTIVATE) {
    return item.status === 'INACTIVE'
  }

  return false
}

function CertificatesListPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const statusFilter = useAppSelector(selectCertificateStatusFilter)
  const certificates = useAppSelector(selectCertificates)
  const certificatesStatus = useAppSelector(selectCertificatesStatus)
  const listError = useAppSelector(selectCertificateManagementError)
  const actionError = useAppSelector(selectCertificateManagementActionError)
  const successMessage = useAppSelector(selectCertificateManagementActionSuccess)
  const actionStatus = useAppSelector(selectCertificateManagementActionStatus)

  const isLoading = certificatesStatus === 'loading'
  const isActing = actionStatus === 'loading'

  const [searchQuery, setSearchQuery] = useState('')
  const [activeAction, setActiveAction] = useState('')
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [actionForm, setActionForm] = useState(getActionDefaults(ACTION_TYPES.RENEW))
  const [localActionError, setLocalActionError] = useState('')

  useEffect(() => {
    if (certificatesStatus === 'idle') {
      dispatch(fetchCertificates(statusFilter === 'ALL' ? '' : statusFilter))
    }
  }, [certificatesStatus, dispatch, statusFilter])

  const groupedCounts = useMemo(() => {
    return {
      ACTIVE: certificates.filter((item) => item.status === 'ACTIVE').length,
      EXPIRED: certificates.filter((item) => item.status === 'EXPIRED').length,
      REVOKED: certificates.filter((item) => item.status === 'REVOKED').length,
      INACTIVE: certificates.filter((item) => item.status === 'INACTIVE').length,
    }
  }, [certificates])

  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return certificates.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const searchableText = [
        item.certificateNumber,
        item.status,
        item.level,
        getHotelName(item),
        item?.hotelId?.businessInfo?.contact?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [certificates, searchQuery, statusFilter])

  function openActionModal(type, certificate) {
    setActiveAction(type)
    setSelectedCertificate(certificate)
    setActionForm(getActionDefaults(type))
    setLocalActionError('')
    dispatch(clearCertificateManagementMessages())
  }

  function closeActionModal() {
    setActiveAction('')
    setSelectedCertificate(null)
    setLocalActionError('')
  }

  function updateActionField(name, value) {
    setActionForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateAction() {
    if (activeAction === ACTION_TYPES.RENEW) {
      const months = Number(actionForm.validityPeriodInMonths)
      if (!months || months < 1 || months > 120) {
        return 'Validity period must be between 1 and 120 months.'
      }
      return ''
    }

    if (!String(actionForm.reason || '').trim()) {
      return 'Reason is required.'
    }

    return ''
  }

  const isActionConfirmDisabled = useMemo(() => {
    if (!selectedCertificate) {
      return true
    }

    if (activeAction === ACTION_TYPES.RENEW) {
      const months = Number(actionForm.validityPeriodInMonths)
      return !months || months < 1 || months > 120
    }

    if (activeAction === ACTION_TYPES.REVOKE || activeAction === ACTION_TYPES.INACTIVATE) {
      return !String(actionForm.reason || '').trim()
    }

    return true
  }, [actionForm.reason, actionForm.validityPeriodInMonths, activeAction, selectedCertificate])

  async function handleConfirmAction() {
    if (!selectedCertificate || !activeAction) {
      return
    }

    const validationError = validateAction()
    if (validationError) {
      setLocalActionError(validationError)
      return
    }

    dispatch(clearCertificateManagementMessages())
    setLocalActionError('')

    try {
      if (activeAction === ACTION_TYPES.RENEW) {
        await dispatch(
          renewCertificateAction({
            certificateId: selectedCertificate._id,
            validityPeriodInMonths: Number(actionForm.validityPeriodInMonths),
          }),
        ).unwrap()
      }

      if (activeAction === ACTION_TYPES.REVOKE) {
        await dispatch(
          revokeCertificateAction({
            certificateId: selectedCertificate._id,
            reason: String(actionForm.reason).trim(),
          }),
        ).unwrap()
      }

      if (activeAction === ACTION_TYPES.INACTIVATE) {
        await dispatch(
          inactivateCertificateAction({
            certificateId: selectedCertificate._id,
            reason: String(actionForm.reason).trim(),
          }),
        ).unwrap()
      }

      await dispatch(fetchCertificates(statusFilter === 'ALL' ? '' : statusFilter))
      closeActionModal()
    } catch (error) {
      setLocalActionError(error.message || 'Action failed')
    }
  }

  const actionMeta = getActionMeta(activeAction)

  return (
    <section className='space-y-4'>
      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-xl font-bold text-slate-900'>Manage Certificates</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Track statuses, search quickly, and run lifecycle actions safely.
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <label className='text-sm font-medium text-slate-700'>
              Search
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder='Certificate, hotel, email...'
                className='mt-1 block w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
              />
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Filter by status
              <select
                value={statusFilter}
                onChange={(event) => {
                  const nextStatus = event.target.value || 'ALL'
                  dispatch(setCertificateStatusFilter(nextStatus))
                  dispatch(fetchCertificates(nextStatus === 'ALL' ? '' : nextStatus))
                }}
                className='mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All' : status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className='mt-4 grid gap-2 sm:grid-cols-4'>
          {Object.entries(groupedCounts).map(([status, count]) => (
            <p key={status} className='rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              <span className='font-semibold'>{status}:</span> {count}
            </p>
          ))}
        </div>
      </article>

      {listError ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{listError}</p>
      ) : null}

      {actionError ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{actionError}</p>
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
                  <th className='px-3 py-2'>Level</th>
                  <th className='px-3 py-2'>Trust</th>
                  <th className='px-3 py-2'>Expiry</th>
                  <th className='px-3 py-2'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((item) => (
                  <tr key={item._id || item.certificateNumber} className='border-b border-slate-100'>
                    <td className='px-3 py-2 font-semibold text-slate-900'>{item.certificateNumber}</td>
                    <td className='px-3 py-2 text-slate-700'>{getHotelName(item)}</td>
                    <td className='px-3 py-2'>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className='px-3 py-2'>
                      <LevelBadge level={item.level} />
                    </td>
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
                              onClick={() => openActionModal(ACTION_TYPES.RENEW, item)}
                              disabled={isActing || isActionDisabled(ACTION_TYPES.RENEW, item)}
                              className='rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60'
                            >
                              Renew
                            </button>
                            <button
                              type='button'
                              onClick={() => openActionModal(ACTION_TYPES.REVOKE, item)}
                              disabled={isActing || isActionDisabled(ACTION_TYPES.REVOKE, item)}
                              className='rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60'
                            >
                              Revoke
                            </button>
                            <button
                              type='button'
                              onClick={() => openActionModal(ACTION_TYPES.INACTIVATE, item)}
                              disabled={isActing || isActionDisabled(ACTION_TYPES.INACTIVATE, item)}
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

            {!filteredCertificates.length ? (
              <p className='px-3 py-4 text-sm text-slate-500'>No certificates found for this filter.</p>
            ) : null}
          </div>
        )}
      </article>

      <LifecycleActionModal
        isOpen={Boolean(activeAction && selectedCertificate)}
        title={actionMeta.title}
        description={actionMeta.description}
        confirmLabel={actionMeta.confirmLabel}
        isSubmitting={isActing}
        isConfirmDisabled={isActionConfirmDisabled}
        onCancel={closeActionModal}
        onConfirm={handleConfirmAction}
      >
        {selectedCertificate ? (
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
            <p>
              <span className='font-semibold'>Certificate:</span> {selectedCertificate.certificateNumber}
            </p>
            <p className='mt-1'>
              <span className='font-semibold'>Hotel:</span> {getHotelName(selectedCertificate)}
            </p>
            <p className='mt-1'>
              <span className='font-semibold'>Current status:</span> {selectedCertificate.status}
            </p>
          </div>
        ) : null}

        {activeAction === ACTION_TYPES.RENEW ? (
          <label className='block text-sm font-medium text-slate-700'>
            Validity period (months)
            <input
              type='number'
              min='1'
              max='120'
              value={actionForm.validityPeriodInMonths}
              onChange={(event) => updateActionField('validityPeriodInMonths', Number(event.target.value))}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
            />
          </label>
        ) : (
          <label className='block text-sm font-medium text-slate-700'>
            Reason
            <textarea
              rows={4}
              value={actionForm.reason}
              onChange={(event) => updateActionField('reason', event.target.value)}
              placeholder='Provide a clear reason for this action'
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
            />
          </label>
        )}

        {localActionError ? (
          <p className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>{localActionError}</p>
        ) : null}
      </LifecycleActionModal>
    </section>
  )
}

export default CertificatesListPage
