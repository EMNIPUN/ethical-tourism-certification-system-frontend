import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useAuth } from '../../auth/hooks/useAuth'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'
import directorSignature from '../../../assets/signature.png'
import '../styles/certificateDetailsPage.css'
import {
  clearCertificateDetailsState,
  clearCertificateManagementMessages,
  deleteCertificateAction,
  fetchCertificateDetails,
  fetchCertificateTimeline,
  renewCertificateAction,
  revokeCertificateAction,
  updateCertificateDetailsAction,
  updateTrustScoreAction,
} from '../store/certificateManagementSlice'
import {
  selectCertificateDetails,
  selectCertificateDetailsError,
  selectCertificateDetailsStatus,
  selectCertificateManagementActionError,
  selectCertificateManagementActionStatus,
  selectCertificateManagementActionSuccess,
  selectCertificateTimeline,
  selectCertificateTimelineError,
  selectCertificateTimelineHasNext,
  selectCertificateTimelinePage,
  selectCertificateTimelineStatus,
  selectCertificateTimelineTotal,
} from '../store/certificateManagementSelectors'

const TIMELINE_EVENT_OPTIONS = [
  '',
  'CERTIFICATE_ISSUED',
  'CERTIFICATE_UPDATED',
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

const EDITABLE_STATUS_OPTIONS = ['ACTIVE', 'EXPIRED', 'REVOKED', 'INACTIVE']
const EDITABLE_LEVEL_OPTIONS = ['PLATINUM', 'GOLD', 'SILVER']

const CERTIFICATE_THEME = {
  ACTIVE: {
    accent: '#0f766e',
    accentSoft: 'rgba(20, 184, 166, 0.16)',
    ribbonStart: '#0f766e',
    ribbonEnd: '#1d4ed8',
    summary: 'This certificate is currently valid and in good standing.',
  },
  EXPIRED: {
    accent: '#b45309',
    accentSoft: 'rgba(245, 158, 11, 0.18)',
    ribbonStart: '#b45309',
    ribbonEnd: '#b91c1c',
    summary: 'This certificate has reached the end of its validity period.',
  },
  REVOKED: {
    accent: '#be123c',
    accentSoft: 'rgba(244, 63, 94, 0.16)',
    ribbonStart: '#9f1239',
    ribbonEnd: '#be123c',
    summary: 'This certificate has been revoked and should not be treated as valid.',
  },
  INACTIVE: {
    accent: '#475569',
    accentSoft: 'rgba(100, 116, 139, 0.2)',
    ribbonStart: '#475569',
    ribbonEnd: '#334155',
    summary: 'This certificate is inactive and retained for compliance history.',
  },
  DEFAULT: {
    accent: '#155e75',
    accentSoft: 'rgba(8, 145, 178, 0.16)',
    ribbonStart: '#155e75',
    ribbonEnd: '#0f172a',
    summary: 'Certificate validity is currently under review.',
  },
}

const LEVEL_BADGE_THEME = {
  GOLD: {
    ribbonTop: '#78350f',
    ribbonBottom: '#b45309',
    outerLight: '#fff4ca',
    outerMid: '#f5b336',
    outerDark: '#8b5e14',
    innerLight: '#fffbe6',
    innerMid: '#ffe18f',
    innerDark: '#d89e2c',
    labelColor: '#78350f',
    levelColor: '#422006',
    codeColor: '#7c2d12',
  },
  SILVER: {
    ribbonTop: '#334155',
    ribbonBottom: '#64748b',
    outerLight: '#f8fafc',
    outerMid: '#d1d5db',
    outerDark: '#6b7280',
    innerLight: '#ffffff',
    innerMid: '#e5e7eb',
    innerDark: '#9ca3af',
    labelColor: '#475569',
    levelColor: '#1f2937',
    codeColor: '#334155',
  },
  PLATINUM: {
    ribbonTop: '#2a1f3d',
    ribbonBottom: '#4c3b6e',
    outerLight: '#fbfaff',
    outerMid: '#e6e1f2',
    outerDark: '#a8a0c2',
    innerLight: '#ffffff',
    innerMid: '#f0ecf8',
    innerDark: '#c5bddb',
    labelColor: '#3b2f57',
    levelColor: '#1f1433',
    codeColor: '#4c3b6e',
  },
  DEFAULT: {
    ribbonTop: '#78350f',
    ribbonBottom: '#b45309',
    outerLight: '#fff4ca',
    outerMid: '#f5b336',
    outerDark: '#8b5e14',
    innerLight: '#fffbe6',
    innerMid: '#ffe18f',
    innerDark: '#d89e2c',
    labelColor: '#78350f',
    levelColor: '#422006',
    codeColor: '#7c2d12',
  },
}

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

function formatDate(value, options = {}) {
  if (!value) {
    return 'N/A'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  if (options.withTime) {
    return date.toLocaleString()
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateInput(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function getCertificateTheme(status) {
  const normalizedStatus = String(status || '').toUpperCase()
  return CERTIFICATE_THEME[normalizedStatus] || CERTIFICATE_THEME.DEFAULT
}

function getLevelBadgeTheme(level) {
  const normalizedLevel = String(level || '').toUpperCase()
  return LEVEL_BADGE_THEME[normalizedLevel] || LEVEL_BADGE_THEME.DEFAULT
}

function buildValidityStatement(certificate) {
  const status = String(certificate?.status || '').toUpperCase()
  const expiryText = formatDate(certificate?.expiryDate)

  if (status === 'EXPIRED') {
    return `Validity ended on ${expiryText}.`
  }

  if (status === 'REVOKED' || status === 'INACTIVE') {
    return `Current status: ${status}. Refer to timeline records for lifecycle details.`
  }

  if (expiryText !== 'N/A') {
    return `Valid through ${expiryText}, subject to compliance and trust-score review.`
  }

  return 'Validity period is unavailable.'
}

function getHotelMapUrl(certificate) {
  const latitude = certificate?.hotelId?.businessInfo?.contact?.gps?.latitude
  const longitude = certificate?.hotelId?.businessInfo?.contact?.gps?.longitude
  const address = certificate?.hotelId?.businessInfo?.contact?.address

  if (latitude !== undefined && longitude !== undefined) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`
  }

  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  return ''
}

function buildCertificateFileBase(certificate) {
  const safeHotelName = String(certificate?.hotelId?.businessInfo?.name || 'hotel')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const safeNumber = String(certificate?.certificateNumber || 'certificate')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')

  const hotelPart = safeHotelName || 'hotel'
  const numberPart = safeNumber || 'certificate'

  return `${hotelPart}-${numberPart}`
}

function CertificateDetailsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { certificateNumber } = useParams()
  const location = useLocation()
  const basePath = location.pathname.startsWith('/admin/certificate-management')
    ? '/admin/certificate-management'
    : '/certificate-management'
  const { user } = useAuth()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'

  const certificate = useAppSelector(selectCertificateDetails)
  const detailsStatus = useAppSelector(selectCertificateDetailsStatus)
  const detailsError = useAppSelector(selectCertificateDetailsError)
  const actionStatus = useAppSelector(selectCertificateManagementActionStatus)
  const actionError = useAppSelector(selectCertificateManagementActionError)
  const actionSuccess = useAppSelector(selectCertificateManagementActionSuccess)
  const timeline = useAppSelector(selectCertificateTimeline)
  const timelineStatus = useAppSelector(selectCertificateTimelineStatus)
  const timelineError = useAppSelector(selectCertificateTimelineError)
  const timelinePage = useAppSelector(selectCertificateTimelinePage)
  const timelineHasNext = useAppSelector(selectCertificateTimelineHasNext)
  const timelineTotal = useAppSelector(selectCertificateTimelineTotal)

  const isLoading = detailsStatus === 'loading'
  const isActing = actionStatus === 'loading'
  const isTimelineLoading = timelineStatus === 'loading'
  const errorMessage = detailsError || actionError
  const successMessage = actionSuccess
  const [timelineFilters, setTimelineFilters] = useState({
    eventType: '',
    from: '',
    to: '',
    order: 'desc',
  })

  const [renewMonths, setRenewMonths] = useState(12)
  const [revokeReason, setRevokeReason] = useState('')
  const [scoreChange, setScoreChange] = useState(-5)
  const [scoreReason, setScoreReason] = useState('')
  const [editValidationError, setEditValidationError] = useState('')
  const [editForm, setEditForm] = useState({
    hotelId: '',
    issuedDate: '',
    expiryDate: '',
    status: 'ACTIVE',
    trustScore: 70,
    level: 'GOLD',
    renewalCount: 0,
    revokedReason: '',
  })
  const [certificateUiMessage, setCertificateUiMessage] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const certificateExportRef = useRef(null)

  async function loadTimeline(certificateId, { page = 1, append = false, filters = timelineFilters } = {}) {
    if (!certificateId) {
      return
    }

    try {
      await dispatch(
        fetchCertificateTimeline({
          certificateId,
          page,
          limit: 20,
          order: filters.order || 'desc',
          eventType: filters.eventType ? [filters.eventType] : undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          append,
        }),
      ).unwrap()
    } catch {
      // Timeline errors are handled in Redux state.
    }
  }

  async function loadCertificateAndTimeline(activeFilters = timelineFilters) {
    dispatch(clearCertificateManagementMessages())
    dispatch(clearCertificateDetailsState())

    try {
      const cert = await dispatch(fetchCertificateDetails(certificateNumber)).unwrap()

      if (cert?._id) {
        await loadTimeline(cert._id, {
          page: 1,
          append: false,
          filters: activeFilters,
        })
      }
    } catch {
      // Details error is handled in Redux state.
    }
  }

  useEffect(() => {
    setCertificateUiMessage('')
    loadCertificateAndTimeline()

    return () => {
      dispatch(clearCertificateDetailsState())
      dispatch(clearCertificateManagementMessages())
    }
    // loadCertificateAndTimeline is intentionally route-driven via certificateNumber.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certificateNumber])

  useEffect(() => {
    if (!certificate) {
      return
    }

    setEditValidationError('')
    setEditForm({
      hotelId: resolveHotelId(certificate),
      issuedDate: formatDateInput(certificate.issuedDate),
      expiryDate: formatDateInput(certificate.expiryDate),
      status: String(certificate.status || 'ACTIVE').toUpperCase(),
      trustScore: Number(certificate.trustScore ?? 70),
      level: String(certificate.level || 'GOLD').toUpperCase(),
      renewalCount: Number(certificate.renewalCount ?? 0),
      revokedReason: certificate.revokedReason || '',
    })
  }, [certificate])

  const hotelId = useMemo(() => resolveHotelId(certificate), [certificate])
  const certificateTheme = useMemo(() => getCertificateTheme(certificate?.status), [certificate?.status])
  const levelBadgeTheme = useMemo(() => getLevelBadgeTheme(certificate?.level), [certificate?.level])
  const certificateThemeStyle = useMemo(() => ({
    '--certificate-accent': certificateTheme.accent,
    '--certificate-soft': certificateTheme.accentSoft,
    '--certificate-ribbon-start': certificateTheme.ribbonStart,
    '--certificate-ribbon-end': certificateTheme.ribbonEnd,
    '--certificate-badge-ribbon-top': levelBadgeTheme.ribbonTop,
    '--certificate-badge-ribbon-bottom': levelBadgeTheme.ribbonBottom,
    '--certificate-badge-outer-light': levelBadgeTheme.outerLight,
    '--certificate-badge-outer-mid': levelBadgeTheme.outerMid,
    '--certificate-badge-outer-dark': levelBadgeTheme.outerDark,
    '--certificate-badge-inner-light': levelBadgeTheme.innerLight,
    '--certificate-badge-inner-mid': levelBadgeTheme.innerMid,
    '--certificate-badge-inner-dark': levelBadgeTheme.innerDark,
    '--certificate-badge-label-color': levelBadgeTheme.labelColor,
    '--certificate-badge-level-color': levelBadgeTheme.levelColor,
    '--certificate-badge-code-color': levelBadgeTheme.codeColor,
  }), [certificateTheme, levelBadgeTheme])
  const mapUrl = useMemo(() => getHotelMapUrl(certificate), [certificate])
  const hotelName = certificate?.hotelId?.businessInfo?.name || 'Certified Hospitality Property'
  const hotelAddress = certificate?.hotelId?.businessInfo?.contact?.address || 'Address unavailable'
  const validityStatement = useMemo(() => buildValidityStatement(certificate), [certificate])
  const certificateFileBase = useMemo(() => buildCertificateFileBase(certificate), [certificate])

  async function runAction(action) {
    dispatch(clearCertificateManagementMessages())
    setCertificateUiMessage('')

    try {
      await action()
      await loadCertificateAndTimeline(timelineFilters)
    } catch {
      // Action errors are handled in Redux state.
    }
  }

  function updateEditField(name, value) {
    setEditValidationError('')
    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function submitCertificateEdit() {
    if (!certificate?._id) {
      return
    }

    if (!editForm.issuedDate || !editForm.expiryDate) {
      setEditValidationError('Issued date and expiry date are required.')
      return
    }

    if (!EDITABLE_STATUS_OPTIONS.includes(editForm.status)) {
      setEditValidationError('Please select a valid certificate status.')
      return
    }

    if (!EDITABLE_LEVEL_OPTIONS.includes(editForm.level)) {
      setEditValidationError('Please select a valid certificate level.')
      return
    }

    if (Number.isNaN(Number(editForm.trustScore)) || Number(editForm.trustScore) < 0 || Number(editForm.trustScore) > 100) {
      setEditValidationError('Trust score must be between 0 and 100.')
      return
    }

    if (Number.isNaN(Number(editForm.renewalCount)) || Number(editForm.renewalCount) < 0) {
      setEditValidationError('Renewal count must be 0 or greater.')
      return
    }

    if (editForm.status === 'REVOKED' && !String(editForm.revokedReason || '').trim()) {
      setEditValidationError('Revoked reason is required when status is REVOKED.')
      return
    }

    await runAction(() =>
      dispatch(
        updateCertificateDetailsAction({
          certificateId: certificate._id,
          hotelId: editForm.hotelId,
          issuedDate: new Date(editForm.issuedDate).toISOString(),
          expiryDate: new Date(editForm.expiryDate).toISOString(),
          status: editForm.status,
          trustScore: Number(editForm.trustScore),
          level: editForm.level,
          renewalCount: Number(editForm.renewalCount),
          revokedReason: editForm.status === 'REVOKED' ? String(editForm.revokedReason || '').trim() : '',
        }),
      ).unwrap(),
    )
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

  async function copyCertificateNumber() {
    if (!certificate?.certificateNumber) {
      setCertificateUiMessage('Certificate number is unavailable.')
      return
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(certificate.certificateNumber)
        setCertificateUiMessage('Certificate number copied to clipboard.')
        return
      } catch {
        setCertificateUiMessage('Unable to copy automatically. You can copy it from the certificate card.')
        return
      }
    }

    setCertificateUiMessage('Clipboard access is not available in this browser.')
  }

  function printCertificate() {
    if (typeof window !== 'undefined' && window.print) {
      window.print()
      setCertificateUiMessage('Print dialog opened for certificate preview.')
    }
  }

  function downloadFile(dataUrl, fileName) {
    if (typeof document === 'undefined') {
      return
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName
    link.click()
  }

  async function captureCertificateCanvas() {
    if (!certificateExportRef.current) {
      throw new Error('Certificate surface is unavailable for export.')
    }

    const scale = typeof window !== 'undefined'
      ? Math.min(3, Math.max(2, window.devicePixelRatio || 2))
      : 2

    return html2canvas(certificateExportRef.current, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      logging: false,
    })
  }

  async function exportCertificateAsJpg() {
    setCertificateUiMessage('')
    setIsExporting(true)

    try {
      const canvas = await captureCertificateCanvas()
      const imageData = canvas.toDataURL('image/jpeg', 0.95)
      downloadFile(imageData, `${certificateFileBase}.jpg`)
      setCertificateUiMessage('Certificate JPG downloaded successfully.')
    } catch (error) {
      setCertificateUiMessage(error.message || 'Unable to export certificate as JPG.')
    } finally {
      setIsExporting(false)
    }
  }

  async function exportCertificateAsPdf() {
    setCertificateUiMessage('')
    setIsExporting(true)

    try {
      const canvas = await captureCertificateCanvas()
      const imageData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const scale = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
      const width = canvas.width * scale
      const height = canvas.height * scale
      const x = (pageWidth - width) / 2
      const y = (pageHeight - height) / 2

      pdf.addImage(imageData, 'JPEG', x, y, width, height, undefined, 'FAST')
      pdf.save(`${certificateFileBase}.pdf`)
      setCertificateUiMessage('Certificate PDF downloaded successfully.')
    } catch (error) {
      setCertificateUiMessage(error.message || 'Unable to export certificate as PDF.')
    } finally {
      setIsExporting(false)
    }
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
        <div className='grid gap-4 xl:grid-cols-12'>
          <div className='space-y-4 xl:col-span-8'>
            <article className='certificate-stage' style={certificateThemeStyle}>
              <div ref={certificateExportRef} className='certificate-export-surface'>
                <div className='certificate-ribbon'>
                  <span className='certificate-font-sans'>Ethical Tourism Certification Register</span>
                  <span className='certificate-font-sans'>Record: {certificate.certificateNumber || 'N/A'}</span>
                </div>

                <div className='certificate-sheet'>
                  <span className='certificate-watermark' aria-hidden='true'>CERTIFIED</span>

                  <div className='certificate-badge' aria-hidden='true'>
                    <span className='certificate-badge-ribbon certificate-badge-ribbon-left' />
                    <span className='certificate-badge-ribbon certificate-badge-ribbon-right' />
                    <div className='certificate-badge-outer'>
                      <div className='certificate-badge-inner'>
                        <p className='certificate-badge-label'>Certification Level</p>
                        <p className='certificate-badge-level'>{certificate.level || 'N/A'}</p>
                        <p className='certificate-badge-code'>
                          {(certificate.certificateNumber || '').slice(-8).toUpperCase() || 'NO-ID'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className='certificate-kicker certificate-font-sans'>Certificate of Compliance</p>
                  <h3 className='certificate-title certificate-font-serif'>Ethical Tourism Assurance Certificate</h3>
                  <p className='certificate-subtitle certificate-font-sans'>
                    Awarded by the Ethical Tourism Certification Authority to recognize verified sustainability,
                    service quality, and governance standards.
                  </p>

                  <p className='certificate-label certificate-font-sans'>This certifies that</p>
                  <p className='certificate-hotel-name certificate-font-serif'>{hotelName}</p>
                  <p className='certificate-address certificate-font-sans'>{hotelAddress}</p>

                  <p className='certificate-statement certificate-font-sans'>
                    has successfully met the current evaluation criteria and is recognized as a certified tourism
                    establishment under the Ethical Tourism Certification Program.
                  </p>

                  <div className='certificate-metrics'>
                    <div>
                      <p className='certificate-metric-label'>Certificate Number</p>
                      <p className='certificate-metric-value'>{certificate.certificateNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className='certificate-metric-label'>Issued On</p>
                      <p className='certificate-metric-value'>{formatDate(certificate.issuedDate)}</p>
                    </div>
                    <div>
                      <p className='certificate-metric-label'>Valid Until</p>
                      <p className='certificate-metric-value'>{formatDate(certificate.expiryDate)}</p>
                    </div>
                    <div>
                      <p className='certificate-metric-label'>Trust Score</p>
                      <p className='certificate-metric-value'>{certificate.trustScore ?? 'N/A'} %</p>
                    </div>
                    <div>
                      <p className='certificate-metric-label'>Hotel Record ID</p>
                      <p className='certificate-metric-value'>{hotelId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className='certificate-metric-label'>Renewal Count</p>
                      <p className='certificate-metric-value'>{certificate.renewalCount ?? 0}</p>
                    </div>
                  </div>

                  <p className='certificate-validity-note certificate-font-sans'>
                    {certificateTheme.summary} {validityStatement}
                  </p>

                  <div className='certificate-signature-row'>
                    <div className='certificate-signature-block'>
                      <img src={directorSignature} alt='Director signature' className='certificate-signature-image' />
                      <p className='certificate-signature-name certificate-font-serif'>Director, Certification Council</p>
                      <p className='certificate-signature-role certificate-font-sans'>Issuing Authority</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='certificate-actions certificate-no-print'>
                <div className='flex flex-wrap items-center gap-2'>
                  <button
                    type='button'
                    onClick={printCertificate}
                    className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50'
                  >
                    Print Certificate
                  </button>
                  <button
                    type='button'
                    onClick={copyCertificateNumber}
                    className='rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100'
                  >
                    Copy Number
                  </button>
                  <button
                    type='button'
                    onClick={exportCertificateAsPdf}
                    disabled={isExporting}
                    className='rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                  <button
                    type='button'
                    onClick={exportCertificateAsJpg}
                    disabled={isExporting}
                    className='rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isExporting ? 'Exporting...' : 'Export JPG'}
                  </button>
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100'
                    >
                      View Location
                    </a>
                  ) : null}
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <StatusBadge status={certificate.status} />
                  <LevelBadge level={certificate.level} />
                  <span className='rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600'>
                    Updated: {formatDate(certificate.updatedAt, { withTime: true })}
                  </span>
                </div>
              </div>

              {certificateUiMessage ? (
                <p className='certificate-action-message certificate-no-print'>{certificateUiMessage}</p>
              ) : null}

              {certificate.revokedReason ? (
                <p className='certificate-status-note'>
                  <span className='font-semibold'>Status Note:</span> {certificate.revokedReason}
                </p>
              ) : null}
            </article>

            <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
              <h3 className='text-lg font-bold text-slate-900'>Hotel Details</h3>
              <div className='mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2'>
                <p><span className='font-semibold'>Hotel Name:</span> {certificate.hotelId?.businessInfo?.name || 'N/A'}</p>
                <p><span className='font-semibold'>Business Type:</span> {certificate.hotelId?.businessInfo?.businessType || 'N/A'}</p>
                <p><span className='font-semibold'>Established Year:</span> {certificate.hotelId?.businessInfo?.yearEstablished || 'N/A'}</p>
                <p><span className='font-semibold'>Owner Name:</span> {certificate.hotelId?.businessInfo?.contact?.ownerName || 'N/A'}</p>
                <p><span className='font-semibold'>Contact Email:</span> {certificate.hotelId?.businessInfo?.contact?.email || 'N/A'}</p>
                <p><span className='font-semibold'>Phone:</span> {certificate.hotelId?.businessInfo?.contact?.phone || 'N/A'}</p>
                <p>
                  <span className='font-semibold'>Website:</span>{' '}
                  {certificate.hotelId?.businessInfo?.contact?.website ? (
                    <a
                      href={certificate.hotelId.businessInfo.contact.website}
                      target='_blank'
                      rel='noreferrer'
                      className='text-cyan-700 underline underline-offset-2 hover:text-cyan-600'
                    >
                      {certificate.hotelId.businessInfo.contact.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
                <p>
                  <span className='font-semibold'>GPS:</span>{' '}
                  {certificate.hotelId?.businessInfo?.contact?.gps?.latitude !== undefined &&
                  certificate.hotelId?.businessInfo?.contact?.gps?.longitude !== undefined
                    ? `${certificate.hotelId.businessInfo.contact.gps.latitude}, ${certificate.hotelId.businessInfo.contact.gps.longitude}`
                    : 'N/A'}
                </p>
                <p className='md:col-span-2'>
                  <span className='font-semibold'>Address:</span> {certificate.hotelId?.businessInfo?.contact?.address || 'N/A'}
                </p>
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
          </div>

          <aside className='space-y-4 xl:col-span-4'>
            {isAdmin ? (
              <>
              <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-slate-900'>Edit Certificate Details</h3>
                <p className='mt-1 text-xs text-slate-500'>Admin can update full certificate fields including status.</p>

                <label className='mt-3 block text-sm font-medium text-slate-700'>
                  Hotel ID
                  <input
                    type='text'
                    value={editForm.hotelId}
                    onChange={(event) => updateEditField('hotelId', event.target.value)}
                    className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                  />
                </label>

                <div className='mt-3 grid gap-3 md:grid-cols-2'>
                  <label className='block text-sm font-medium text-slate-700'>
                    Issued Date
                    <input
                      type='date'
                      value={editForm.issuedDate}
                      onChange={(event) => updateEditField('issuedDate', event.target.value)}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                  <label className='block text-sm font-medium text-slate-700'>
                    Expiry Date
                    <input
                      type='date'
                      value={editForm.expiryDate}
                      onChange={(event) => updateEditField('expiryDate', event.target.value)}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                </div>

                <div className='mt-3 grid gap-3 md:grid-cols-2'>
                  <label className='block text-sm font-medium text-slate-700'>
                    Status
                    <select
                      value={editForm.status}
                      onChange={(event) => updateEditField('status', event.target.value)}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
                    >
                      {EDITABLE_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>

                  <label className='block text-sm font-medium text-slate-700'>
                    Level
                    <select
                      value={editForm.level}
                      onChange={(event) => updateEditField('level', event.target.value)}
                      className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
                    >
                      {EDITABLE_LEVEL_OPTIONS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className='mt-3 grid gap-3 md:grid-cols-2'>
                  <label className='block text-sm font-medium text-slate-700'>
                    Trust Score
                    <input
                      type='number'
                      min='0'
                      max='100'
                      value={editForm.trustScore}
                      onChange={(event) => updateEditField('trustScore', Number(event.target.value))}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                  <label className='block text-sm font-medium text-slate-700'>
                    Renewal Count
                    <input
                      type='number'
                      min='0'
                      value={editForm.renewalCount}
                      onChange={(event) => updateEditField('renewalCount', Number(event.target.value))}
                      className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                    />
                  </label>
                </div>

                <label className='mt-3 block text-sm font-medium text-slate-700'>
                  Revoked Reason
                  <textarea
                    value={editForm.revokedReason}
                    onChange={(event) => updateEditField('revokedReason', event.target.value)}
                    rows={3}
                    placeholder='Required if status is REVOKED'
                    className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
                  />
                </label>

                {editValidationError ? (
                  <p className='mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>
                    {editValidationError}
                  </p>
                ) : null}

                <button
                  type='button'
                  disabled={isActing}
                  onClick={submitCertificateEdit}
                  className='mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60'
                >
                  Update Certificate
                </button>
              </article>

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
                  onClick={() =>
                    runAction(() =>
                      dispatch(
                        renewCertificateAction({
                          certificateId: certificate._id,
                          validityPeriodInMonths: renewMonths,
                        }),
                      ).unwrap(),
                    )
                  }
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
                  onClick={() =>
                    runAction(() =>
                      dispatch(
                        revokeCertificateAction({
                          certificateId: certificate._id,
                          reason: revokeReason.trim(),
                        }),
                      ).unwrap(),
                    )
                  }
                  className='mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60'
                >
                  Revoke
                </button>
              </article>

              <article className='rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-rose-900'>Delete Certificate Permanently</h3>
                <p className='mt-3 text-sm text-rose-700'>
                  This is a hard delete admin cleanup. The certificate and timeline records will be permanently removed.
                </p>
                <button
                  type='button'
                  disabled={isActing}
                  onClick={async () => {
                    const confirmed = window.confirm('Permanently delete this certificate? This cannot be undone.')
                    if (!confirmed) {
                      return
                    }

                    dispatch(clearCertificateManagementMessages())
                    setCertificateUiMessage('')

                    try {
                      await dispatch(
                        deleteCertificateAction({
                          certificateId: certificate._id,
                        }),
                      ).unwrap()

                      navigate(basePath)
                    } catch {
                      // Action errors are handled in Redux state.
                    }
                  }}
                  className='mt-3 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60'
                >
                  Delete Permanently
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
                  onClick={() =>
                    runAction(() =>
                      dispatch(
                        updateTrustScoreAction({
                          certificateId: certificate._id,
                          scoreChange,
                          reason: scoreReason.trim(),
                        }),
                      ).unwrap(),
                    )
                  }
                  className='mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60'
                >
                  Update Trust Score
                </button>
              </article>

          
              </>
            ) : (
              <article className='rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm'>
                <h3 className='text-lg font-bold text-amber-900'>Actions</h3>
                <p className='mt-2 text-sm text-amber-700'>
                  You can view certificate details and timeline, but lifecycle actions are restricted to admins.
                </p>
              </article>
            )}
          </aside>
        </div>
      ) : (
        <article className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-slate-500'>Certificate not found.</p>
        </article>
      )}
    </section>
  )
}

export default CertificateDetailsPage
