import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useAuth } from '../../auth/hooks/useAuth'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'
import LifecycleActionModal from '../components/LifecycleActionModal'
import {
  clearCertificateManagementMessages,
  deleteCertificateAction,
  fetchCertificates,
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
  DELETE: 'DELETE',
}

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED', 'INACTIVE']
const LEVEL_OPTIONS = ['PLATINUM', 'GOLD', 'SILVER']

function normalizeStatus(value) {
  const upper = String(value || '').toUpperCase()
  return STATUS_OPTIONS.includes(upper) ? upper : 'ALL'
}

function normalizeLevel(value) {
  const upper = String(value || '').toUpperCase()
  return LEVEL_OPTIONS.includes(upper) ? upper : ''
}

function toDate(value) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
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
    title: 'Delete Certificate Permanently',
    description: 'This is a hard-delete action. Certificate and its timeline records will be removed permanently.',
    confirmLabel: 'Delete permanently',
  }
}

function isActionDisabled(type, item) {
  if (type === ACTION_TYPES.RENEW) {
    return item.status === 'REVOKED'
  }

  if (type === ACTION_TYPES.REVOKE) {
    return item.status === 'REVOKED'
  }

  return false
}

function CertificatesListPage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
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

  const statusFromQuery = useMemo(
    () => normalizeStatus(searchParams.get('status')),
    [searchParams],
  )
  const levelFromQuery = useMemo(
    () => normalizeLevel(searchParams.get('level')),
    [searchParams],
  )
  const expiringOnlyFromQuery = useMemo(() => searchParams.get('expiring') === '45', [searchParams])
  const searchFromQuery = useMemo(() => searchParams.get('q') || '', [searchParams])

  const [searchQuery, setSearchQuery] = useState(searchFromQuery)
  const [levelFilter, setLevelFilter] = useState(levelFromQuery)
  const [activeAction, setActiveAction] = useState('')
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [actionForm, setActionForm] = useState(getActionDefaults(ACTION_TYPES.RENEW))
  const [localActionError, setLocalActionError] = useState('')

  useEffect(() => {
    if (statusFilter !== statusFromQuery) {
      dispatch(setCertificateStatusFilter(statusFromQuery))
    }
  }, [dispatch, statusFilter, statusFromQuery])

  useEffect(() => {
    dispatch(fetchCertificates(statusFromQuery === 'ALL' ? '' : statusFromQuery))
  }, [dispatch, statusFromQuery])

  useEffect(() => {
    setSearchQuery(searchFromQuery)
  }, [searchFromQuery])

  useEffect(() => {
    setLevelFilter(levelFromQuery)
  }, [levelFromQuery])

  function updateListQuery({ status, level, search, expiringOnly = false }) {
    const nextStatus = normalizeStatus(status)
    const nextLevel = normalizeLevel(level)
    const nextSearch = String(search || '').trim()

    const nextParams = new URLSearchParams()

    if (nextStatus !== 'ALL') {
      nextParams.set('status', nextStatus)
    }

    if (nextLevel) {
      nextParams.set('level', nextLevel)
    }

    if (nextSearch) {
      nextParams.set('q', nextSearch)
    }

    if (expiringOnly) {
      nextParams.set('expiring', '45')
    }

    setSearchParams(nextParams)
  }

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
      if (statusFromQuery !== 'ALL' && item.status !== statusFromQuery) {
        return false
      }

      if (levelFilter && String(item.level || '').toUpperCase() !== levelFilter) {
        return false
      }

      if (expiringOnlyFromQuery) {
        if (item.status !== 'ACTIVE') {
          return false
        }

        const daysLeft = daysBetween(new Date(), item.expiryDate)
        if (daysLeft === null || daysLeft < 0 || daysLeft > 45) {
          return false
        }
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
  }, [certificates, expiringOnlyFromQuery, levelFilter, searchQuery, statusFromQuery])

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

    if (activeAction === ACTION_TYPES.REVOKE && !String(actionForm.reason || '').trim()) {
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

    if (activeAction === ACTION_TYPES.REVOKE) {
      return !String(actionForm.reason || '').trim()
    }

    if (activeAction === ACTION_TYPES.DELETE) {
      return false
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

      if (activeAction === ACTION_TYPES.DELETE) {
        await dispatch(
          deleteCertificateAction({
            certificateId: selectedCertificate._id,
          }),
        ).unwrap()
      }

      await dispatch(fetchCertificates(statusFromQuery === 'ALL' ? '' : statusFromQuery))
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
                onChange={(event) => {
                  const nextSearch = event.target.value
                  setSearchQuery(nextSearch)
                  updateListQuery({
                    status: statusFromQuery,
                    level: levelFilter,
                    search: nextSearch,
                    expiringOnly: expiringOnlyFromQuery,
                  })
                }}
                placeholder='Certificate, hotel, email...'
                className='mt-1 block w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
              />
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Filter by status
              <select
                value={statusFromQuery}
                onChange={(event) => {
                  const nextStatus = event.target.value || 'ALL'
                  const nextLevel = nextStatus === 'ACTIVE' ? levelFilter : ''
                  setLevelFilter(nextLevel)
                  updateListQuery({
                    status: nextStatus,
                    level: nextLevel,
                    search: searchQuery,
                    expiringOnly: expiringOnlyFromQuery && nextStatus === 'ACTIVE',
                  })
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

            <label className='text-sm font-medium text-slate-700'>
              Filter by level
              <select
                value={levelFilter}
                onChange={(event) => {
                  const nextLevel = normalizeLevel(event.target.value)
                  const nextStatus = nextLevel ? 'ACTIVE' : statusFromQuery
                  setLevelFilter(nextLevel)
                  updateListQuery({
                    status: nextStatus,
                    level: nextLevel,
                    search: searchQuery,
                    expiringOnly: expiringOnlyFromQuery && nextStatus === 'ACTIVE',
                  })
                }}
                className='mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
              >
                <option value=''>All levels</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {statusFromQuery !== 'ALL' || levelFilter || searchQuery.trim() || expiringOnlyFromQuery ? (
          <div className='mt-3'>
            <button
              type='button'
              onClick={() => {
                setSearchQuery('')
                setLevelFilter('')
                updateListQuery({ status: 'ALL', level: '', search: '', expiringOnly: false })
              }}
              className='rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100'
            >
              Clear shared filters
            </button>
          </div>
        ) : null}

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
                              onClick={() => openActionModal(ACTION_TYPES.DELETE, item)}
                              disabled={isActing}
                              className='rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60'
                            >
                              Delete
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
        ) : activeAction === ACTION_TYPES.REVOKE ? (
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
        ) : (
          <p className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800'>
            This action permanently deletes the certificate and cannot be undone.
          </p>
        )}

        {localActionError ? (
          <p className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>{localActionError}</p>
        ) : null}
      </LifecycleActionModal>
    </section>
  )
}

export default CertificatesListPage
