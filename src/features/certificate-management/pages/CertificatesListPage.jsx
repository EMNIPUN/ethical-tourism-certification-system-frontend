import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BadgeCheck,
  CalendarClock,
  Filter,
  ListFilter,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquareStack,
} from 'lucide-react'
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
const SORT_OPTIONS = ['UPDATED_DESC', 'TRUST_DESC', 'EXPIRY_ASC', 'HOTEL_ASC']

const CARD_BASE =
  'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.1)]'

const STATUS_TONE = {
  ACTIVE: 'bg-emerald-500',
  EXPIRED: 'bg-amber-500',
  REVOKED: 'bg-rose-500',
  INACTIVE: 'bg-slate-500',
}

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

function formatDate(value) {
  const parsed = toDate(value)
  if (!parsed) {
    return 'N/A'
  }

  return parsed.toLocaleDateString()
}

function getCertificateKey(item) {
  return item?._id || item?.certificateNumber || ''
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

function getPercentage(value, total) {
  if (!total) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
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
  const [sortBy, setSortBy] = useState('UPDATED_DESC')
  const [selectedCertificateId, setSelectedCertificateId] = useState('')
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

  useEffect(
    () => () => {
      dispatch(clearCertificateManagementMessages())
    },
    [dispatch],
  )

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

    setSearchParams(nextParams, { replace: true })
  }

  const groupedCounts = useMemo(() => {
    return {
      ACTIVE: certificates.filter((item) => item.status === 'ACTIVE').length,
      EXPIRED: certificates.filter((item) => item.status === 'EXPIRED').length,
      REVOKED: certificates.filter((item) => item.status === 'REVOKED').length,
      INACTIVE: certificates.filter((item) => item.status === 'INACTIVE').length,
    }
  }, [certificates])

  const metrics = useMemo(() => {
    const expiringSoon = certificates.filter((item) => {
      if (item.status !== 'ACTIVE') {
        return false
      }

      const daysLeft = daysBetween(new Date(), item.expiryDate)
      return typeof daysLeft === 'number' && daysLeft >= 0 && daysLeft <= 45
    }).length

    const activeTrustScores = certificates
      .filter((item) => item.status === 'ACTIVE')
      .map((item) => Number(item.trustScore))
      .filter((score) => Number.isFinite(score))

    const averageActiveTrust = activeTrustScores.length
      ? Math.round(activeTrustScores.reduce((sum, score) => sum + score, 0) / activeTrustScores.length)
      : 0

    return {
      total: certificates.length,
      active: groupedCounts.ACTIVE,
      expiringSoon,
      riskStates: groupedCounts.EXPIRED + groupedCounts.REVOKED + groupedCounts.INACTIVE,
      averageActiveTrust,
    }
  }, [certificates, groupedCounts])

  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const rows = certificates.filter((item) => {
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

    const sortedRows = [...rows].sort((a, b) => {
      if (sortBy === 'TRUST_DESC') {
        return Number(b.trustScore || 0) - Number(a.trustScore || 0)
      }

      if (sortBy === 'EXPIRY_ASC') {
        const aDays = daysBetween(new Date(), a.expiryDate)
        const bDays = daysBetween(new Date(), b.expiryDate)
        const aScore = typeof aDays === 'number' ? aDays : Number.POSITIVE_INFINITY
        const bScore = typeof bDays === 'number' ? bDays : Number.POSITIVE_INFINITY
        return aScore - bScore
      }

      if (sortBy === 'HOTEL_ASC') {
        return getHotelName(a).localeCompare(getHotelName(b))
      }

      const aTime = toDate(a.updatedAt)?.getTime() || toDate(a.issuedDate)?.getTime() || 0
      const bTime = toDate(b.updatedAt)?.getTime() || toDate(b.issuedDate)?.getTime() || 0
      return bTime - aTime
    })

    return sortedRows
  }, [certificates, expiringOnlyFromQuery, levelFilter, searchQuery, sortBy, statusFromQuery])

  useEffect(() => {
    if (!filteredCertificates.length) {
      setSelectedCertificateId('')
      return
    }

    const hasSelected = filteredCertificates.some((item) => getCertificateKey(item) === selectedCertificateId)
    if (hasSelected) {
      return
    }

    setSelectedCertificateId(getCertificateKey(filteredCertificates[0]))
  }, [filteredCertificates, selectedCertificateId])

  const selectedCertificateFromList = useMemo(
    () => filteredCertificates.find((item) => getCertificateKey(item) === selectedCertificateId) || null,
    [filteredCertificates, selectedCertificateId],
  )

  const activeFilters = useMemo(() => {
    const chips = []
    if (statusFromQuery !== 'ALL') {
      chips.push(`Status: ${statusFromQuery}`)
    }
    if (levelFilter) {
      chips.push(`Level: ${levelFilter}`)
    }
    if (searchQuery.trim()) {
      chips.push(`Search: ${searchQuery.trim()}`)
    }
    if (expiringOnlyFromQuery) {
      chips.push('Expiring in 45 days')
    }
    return chips
  }, [expiringOnlyFromQuery, levelFilter, searchQuery, statusFromQuery])

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
    <section className='space-y-6 rounded-[20px] bg-[#f8fafc] p-4 sm:p-5 xl:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Manage Certificates</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Lifecycle control center with smarter filters, faster triage, and safer admin operations.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600'>
            <Sparkles className='h-3.5 w-3.5 text-indigo-600' />
            {isAdmin ? 'Admin mode: lifecycle actions enabled' : 'Auditor mode: read-only controls'}
          </div>
          <Link
            to='../issuance'
            className='inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-100'
          >
            <ShieldCheck className='h-3.5 w-3.5' />
            Open Issuance Hub
          </Link>
        </div>
      </div>

      {listError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{listError}</p>
      ) : null}

      {actionError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{actionError}</p>
      ) : null}

      {successMessage ? (
        <p className='rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700'>{successMessage}</p>
      ) : null}

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <article className={`${CARD_BASE} border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100/40`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Total</span>
            <SquareStack className='h-4 w-4 text-slate-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{metrics.total}</p>
          <p className='mt-1 text-xs text-slate-500'>{filteredCertificates.length} visible after filters.</p>
        </article>

        <article className={`${CARD_BASE} border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-slate-100/30`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Active</span>
            <ShieldCheck className='h-4 w-4 text-emerald-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{metrics.active}</p>
          <p className='mt-1 text-xs text-slate-500'>Currently valid and in good standing.</p>
        </article>

        <article className={`${CARD_BASE} border-amber-200 bg-gradient-to-br from-amber-50 via-white to-slate-100/30`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Expiring 45d</span>
            <CalendarClock className='h-4 w-4 text-amber-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{metrics.expiringSoon}</p>
          <p className='mt-1 text-xs text-slate-500'>Needs renewal planning this cycle.</p>
        </article>

        <article className={`${CARD_BASE} border-rose-200 bg-gradient-to-br from-rose-50 via-white to-slate-100/30`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Risk States</span>
            <ShieldAlert className='h-4 w-4 text-rose-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{metrics.riskStates}</p>
          <p className='mt-1 text-xs text-slate-500'>Expired, revoked, and inactive combined.</p>
        </article>

        <article className={`${CARD_BASE} border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-slate-100/30`}>
          <div className='flex items-center justify-between text-xs uppercase tracking-wide text-slate-500'>
            <span>Avg Active Trust</span>
            <BadgeCheck className='h-4 w-4 text-cyan-600' />
          </div>
          <p className='mt-2 text-2xl font-bold text-slate-900'>{metrics.averageActiveTrust}</p>
          <p className='mt-1 text-xs text-slate-500'>Average trust score of active certificates.</p>
        </article>
      </div>

      <div className='grid gap-6 xl:grid-cols-12'>
        <article className={`${CARD_BASE} xl:col-span-8`}>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>Certificate Registry</h3>
              <p className='text-sm text-slate-500'>Filter, inspect, and act on lifecycle transitions from one workspace.</p>
            </div>
            <div className='rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600'>
              Showing {filteredCertificates.length} of {certificates.length}
            </div>
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <label className='text-sm font-medium text-slate-700'>
              Search
              <div className='relative mt-1'>
                <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
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
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                />
              </div>
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Status
              <div className='relative mt-1'>
                <Filter className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
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
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === 'ALL' ? 'All statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className='text-sm font-medium text-slate-700'>
              Level
              <div className='relative mt-1'>
                <ListFilter className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
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
                  className='w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm'
                >
                  <option value=''>All levels</option>
                  {LEVEL_OPTIONS.map((level) => (
                    <option key={level} value={level}>
                      {level}
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
                    {option === 'UPDATED_DESC'
                      ? 'Latest updates'
                      : option === 'TRUST_DESC'
                        ? 'Highest trust'
                        : option === 'EXPIRY_ASC'
                          ? 'Expiry soonest'
                          : 'Hotel name A-Z'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <label className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700'>
              <input
                type='checkbox'
                checked={expiringOnlyFromQuery}
                onChange={(event) =>
                  updateListQuery({
                    status: statusFromQuery,
                    level: levelFilter,
                    search: searchQuery,
                    expiringOnly: event.target.checked && statusFromQuery === 'ACTIVE',
                  })
                }
              />
              Expiring in next 45 days
            </label>

            {activeFilters.length ? (
              <button
                type='button'
                onClick={() => {
                  setSearchQuery('')
                  setLevelFilter('')
                  updateListQuery({ status: 'ALL', level: '', search: '', expiringOnly: false })
                }}
                className='inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 ease-out hover:bg-slate-100'
              >
                <RefreshCcw className='h-3.5 w-3.5' />
                Clear shared filters
              </button>
            ) : null}
          </div>

          <div className='mt-4 overflow-hidden rounded-xl border border-slate-200'>
            {isLoading ? (
              <p className='bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading certificates...</p>
            ) : (
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-slate-50 text-left text-xs uppercase text-slate-500'>
                    <tr>
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
                    {filteredCertificates.map((item, index) => {
                      const key = getCertificateKey(item)
                      const isSelected = selectedCertificateId === key
                      const daysLeft = daysBetween(new Date(), item.expiryDate)

                      return (
                        <tr
                          key={key}
                          onClick={() => setSelectedCertificateId(key)}
                          className={[
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-indigo-50/70' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40',
                            'hover:bg-indigo-50/50',
                          ].join(' ')}
                        >
                          <td className='px-3 py-2'>
                            <p className='font-semibold text-slate-900'>{item.certificateNumber}</p>
                            <p className='text-xs text-slate-500'>Issued: {formatDate(item.issuedDate)}</p>
                          </td>
                          <td className='px-3 py-2 text-slate-700'>
                            <p className='font-medium text-slate-800'>{getHotelName(item)}</p>
                            <p className='text-xs text-slate-500'>{item?.hotelId?.businessInfo?.contact?.email || 'No email'}</p>
                          </td>
                          <td className='px-3 py-2'>
                            <StatusBadge status={item.status} />
                          </td>
                          <td className='px-3 py-2'>
                            <LevelBadge level={item.level} />
                          </td>
                          <td className='px-3 py-2 text-slate-700'>{item.trustScore ?? 'N/A'}</td>
                          <td className='px-3 py-2 text-slate-700'>
                            <p>{formatDate(item.expiryDate)}</p>
                            {typeof daysLeft === 'number' ? (
                              <p className='text-xs text-slate-500'>
                                {daysLeft >= 0 ? `${daysLeft} day(s) left` : `${Math.abs(daysLeft)} day(s) overdue`}
                              </p>
                            ) : null}
                          </td>
                          <td className='px-3 py-2'>
                            <div className='flex flex-wrap gap-2'>
                              <Link
                                to={`./${encodeURIComponent(item.certificateNumber)}`}
                                onClick={(event) => event.stopPropagation()}
                                className='rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition duration-200 ease-out hover:bg-slate-100'
                              >
                                View
                              </Link>

                              {/* {isAdmin ? (
                                <>
                                  <button
                                    type='button'
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      openActionModal(ACTION_TYPES.RENEW, item)
                                    }}
                                    disabled={isActing || isActionDisabled(ACTION_TYPES.RENEW, item)}
                                    className='rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 transition duration-200 ease-out hover:bg-emerald-100 disabled:opacity-60'
                                  >
                                    Renew
                                  </button>
                                  <button
                                    type='button'
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      openActionModal(ACTION_TYPES.REVOKE, item)
                                    }}
                                    disabled={isActing || isActionDisabled(ACTION_TYPES.REVOKE, item)}
                                    className='rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 transition duration-200 ease-out hover:bg-rose-100 disabled:opacity-60'
                                  >
                                    Revoke
                                  </button>
                                  <button
                                    type='button'
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      openActionModal(ACTION_TYPES.DELETE, item)
                                    }}
                                    disabled={isActing}
                                    className='rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 transition duration-200 ease-out hover:bg-amber-100 disabled:opacity-60'
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : null} */}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {!filteredCertificates.length ? (
                  <p className='px-4 py-6 text-sm text-slate-500'>No certificates found for the current filter set.</p>
                ) : null}
              </div>
            )}
          </div>
        </article>

        <article className={`${CARD_BASE} xl:col-span-4`}>
          <h3 className='text-lg font-semibold text-slate-900'>Certificate Focus</h3>
          <p className='mt-1 text-sm text-slate-500'>Select a row to inspect details and trigger lifecycle actions faster.</p>

          {selectedCertificateFromList ? (
            <div className='mt-4 space-y-3 text-sm'>
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <p className='font-semibold text-slate-900'>{selectedCertificateFromList.certificateNumber}</p>
                <p className='mt-1 text-xs text-slate-600'>{getHotelName(selectedCertificateFromList)}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <StatusBadge status={selectedCertificateFromList.status} />
                  <LevelBadge level={selectedCertificateFromList.level} />
                </div>
              </div>

              <div className='rounded-xl border border-slate-200 bg-white p-3'>
                <p className='text-xs uppercase tracking-wide text-slate-500'>Snapshot</p>
                <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700'>
                  <div>
                    <p className='text-slate-500'>Trust Score</p>
                    <p className='font-semibold text-slate-900'>{selectedCertificateFromList.trustScore ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Renewals</p>
                    <p className='font-semibold text-slate-900'>{selectedCertificateFromList.renewalCount ?? 0}</p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Issued</p>
                    <p className='font-semibold text-slate-900'>{formatDate(selectedCertificateFromList.issuedDate)}</p>
                  </div>
                  <div>
                    <p className='text-slate-500'>Expiry</p>
                    <p className='font-semibold text-slate-900'>{formatDate(selectedCertificateFromList.expiryDate)}</p>
                  </div>
                </div>
              </div>

              <div className='grid gap-2'>
                <Link
                  to={`./${encodeURIComponent(selectedCertificateFromList.certificateNumber)}`}
                  className='inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 ease-out hover:bg-slate-100'
                >
                  View Full Details
                </Link>

                {isAdmin ? (
                  <div className='grid grid-cols-3 gap-2'>
                    <button
                      type='button'
                      onClick={() => openActionModal(ACTION_TYPES.RENEW, selectedCertificateFromList)}
                      disabled={isActing || isActionDisabled(ACTION_TYPES.RENEW, selectedCertificateFromList)}
                      className='rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 transition duration-200 ease-out hover:bg-emerald-100 disabled:opacity-60'
                    >
                      Renew
                    </button>
                    <button
                      type='button'
                      onClick={() => openActionModal(ACTION_TYPES.REVOKE, selectedCertificateFromList)}
                      disabled={isActing || isActionDisabled(ACTION_TYPES.REVOKE, selectedCertificateFromList)}
                      className='rounded-xl border border-rose-300 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 transition duration-200 ease-out hover:bg-rose-100 disabled:opacity-60'
                    >
                      Revoke
                    </button>
                    <button
                      type='button'
                      onClick={() => openActionModal(ACTION_TYPES.DELETE, selectedCertificateFromList)}
                      disabled={isActing}
                      className='rounded-xl border border-amber-300 bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 transition duration-200 ease-out hover:bg-amber-100 disabled:opacity-60'
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <p className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600'>
                    Read-only mode enabled. Switch to Admin role to run lifecycle actions.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className='mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500'>
              Select a certificate row to view contextual details.
            </p>
          )}

          <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <p className='text-xs uppercase tracking-wide text-slate-500'>Status Mix</p>
            <div className='mt-2 space-y-2'>
              {Object.entries(groupedCounts).map(([status, count]) => {
                const percentage = getPercentage(count, metrics.total)
                return (
                  <div key={status}>
                    <div className='mb-1 flex items-center justify-between text-xs text-slate-600'>
                      <span>{status}</span>
                      <span>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className='h-2 rounded-full bg-slate-200'>
                      <div
                        className={`h-2 rounded-full ${STATUS_TONE[status] || 'bg-slate-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='mt-4 rounded-xl border border-slate-200 bg-white p-3'>
            <p className='text-xs uppercase tracking-wide text-slate-500'>Active Filters</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {activeFilters.length ? (
                activeFilters.map((chip) => (
                  <span key={chip} className='rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700'>
                    {chip}
                  </span>
                ))
              ) : (
                <span className='text-xs text-slate-500'>No filters applied.</span>
              )}
            </div>
          </div>
        </article>
      </div>

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
