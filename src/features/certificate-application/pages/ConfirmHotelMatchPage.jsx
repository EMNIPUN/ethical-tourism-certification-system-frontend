import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Award,
    BarChart2,
    Building2,
    CheckCircle2,
    ChevronRight,
    MapPin,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import GoogleCandidatePicker from '../components/GoogleCandidatePicker'
import {
    selectConfirmError,
    selectConfirmResult,
    selectConfirmStatus,
    selectCreateResult,
    selectHotelDetails,
    selectHotelDetailsError,
    selectHotelDetailsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotel, submitConfirmMatch } from '../store/certificateApplicationSlice'

function ConfirmHotelMatchPage() {
    const { id }       = useParams()
    const dispatch     = useDispatch()
    const navigate     = useNavigate()

    const createResult  = useSelector(selectCreateResult)
    const confirmStatus = useSelector(selectConfirmStatus)
    const confirmError  = useSelector(selectConfirmError)
    const confirmResult = useSelector(selectConfirmResult)

    const hotel       = useSelector(selectHotelDetails)
    const hotelStatus = useSelector(selectHotelDetailsStatus)
    const hotelError  = useSelector(selectHotelDetailsError)

    const candidates = useMemo(
        () => (createResult?.hotelId === id ? createResult?.candidates || [] : []),
        [createResult, id]
    )

    const [placeId,   setPlaceId]   = useState('')
    const [thumbnail, setThumbnail] = useState('')

    const loadHotel = useCallback(() => { dispatch(fetchHotel(id)) }, [dispatch, id])
    useEffect(() => { loadHotel() }, [loadHotel])

    async function handleConfirm() {
        const resolved = placeId?.trim() ? placeId.trim() : null
        const action   = await dispatch(submitConfirmMatch({ hotelId: id, placeId: resolved, thumbnail }))
        if (submitConfirmMatch.fulfilled.match(action)) {
            navigate(`/certificate-application/${id}`, { replace: true })
        }
    }

    const isLoading = confirmStatus === 'loading'

    return (
        <>
            {/* Hero header */}
            <header className='ca-hero ca-animate-up'>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem' }}>
                    <div>
                        {/* Breadcrumb */}
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                            <Link
                                to='/certificate-application'
                                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7b88a6', textDecoration: 'none' }}
                            >
                                Applications
                            </Link>
                            <ChevronRight size={12} strokeWidth={2.5} style={{ color: '#8c98af' }} />
                            <Link
                                to={`/certificate-application/${id}`}
                                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7b88a6', textDecoration: 'none' }}
                            >
                                Details
                            </Link>
                            <ChevronRight size={12} strokeWidth={2.5} style={{ color: '#8c98af' }} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2345' }}>Confirm match</span>
                        </nav>

                        <span className='ca-hero-eyebrow'>
                            <MapPin size={11} strokeWidth={3} />
                            Step 2 — Google Profile Match
                        </span>
                        <h1 className='ca-hero-title' style={{ fontSize: 'clamp(1.4rem,2.8vw,2rem)' }}>
                            Confirm Google Business profile
                        </h1>
                        <p className='ca-hero-desc'>
                            Select the correct listing to enable accurate review-based scoring for your certification.
                        </p>
                    </div>

                    <Link
                        to={`/certificate-application/${id}`}
                        className='ca-btn-secondary'
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} />
                        Back to details
                    </Link>
                </div>
            </header>

            {/* Error banner */}
            {confirmError ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <AlertTriangle size={16} strokeWidth={2.2} className='ca-banner-icon' />
                    <p className='ca-banner-text'>{confirmError}</p>
                </div>
            ) : null}

            {/* Hotel identity card */}
            <AsyncState
                status={hotelStatus}
                error={hotelError}
                loadingMessage='Loading hotel details…'
                onRetry={loadHotel}
                retryLabel='Reload'
            >
                <div className='ca-section-card ca-animate-up-1'>
                    <div className='ca-section-header'>
                        <div className='ca-section-icon'>
                            <Building2 size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <p className='ca-section-title'>{hotel?.businessInfo?.name || 'Hotel'}</p>
                            <p className='ca-section-desc'>
                                <MapPin size={11} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem' }} />
                                {hotel?.businessInfo?.contact?.address || '—'}
                            </p>
                        </div>
                        <span
                            style={{
                                background: 'rgba(88,104,216,0.08)',
                                border: '1px solid rgba(88,104,216,0.2)',
                                color: '#4a52c9',
                                borderRadius: '999px',
                                padding: '0.25rem 0.8rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.09em',
                            }}
                        >
                            {hotel?.businessInfo?.businessType || 'Hotel'}
                        </span>
                    </div>
                </div>
            </AsyncState>

            {/* Candidate picker */}
            <div className='ca-animate-up-2'>
                <GoogleCandidatePicker
                    candidates={candidates}
                    selectedPlaceId={placeId}
                    onChange={(id, thumb) => { setPlaceId(id); setThumbnail(thumb || '') }}
                    allowManualEntry
                />
            </div>

            {/* Evaluation result card */}
            {confirmResult?.evaluation ? (
                <div className='ca-section-card ca-animate-scale'>
                    <div className='ca-section-header'>
                        <div className='ca-section-icon' style={{ background: 'rgba(31,108,68,0.1)', color: '#1f6c44' }}>
                            <BarChart2 size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <p className='ca-section-title'>Evaluation result</p>
                            <p className='ca-section-desc'>{confirmResult.message}</p>
                        </div>
                        <span
                            style={{
                                background: 'rgba(31,108,68,0.09)',
                                border: '1px solid rgba(31,108,68,0.22)',
                                color: '#1f6c44',
                                borderRadius: '999px',
                                padding: '0.25rem 0.8rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.09em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                            }}
                        >
                            <CheckCircle2 size={12} strokeWidth={2.5} />
                            Evaluated
                        </span>
                    </div>
                    <div className='ca-section-body'>
                        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                            <div className='ca-detail-stat'>
                                <p className='ca-detail-stat-label'>Status</p>
                                <p className='ca-detail-stat-value' style={{ fontSize: '1.1rem' }}>
                                    {confirmResult.evaluation.status}
                                </p>
                            </div>
                            <div className='ca-detail-stat'>
                                <p className='ca-detail-stat-label'>AI confidence score</p>
                                <p className='ca-detail-stat-value' style={{ fontSize: '1.1rem' }}>
                                    {confirmResult.evaluation.aiScore ?? '—'}
                                </p>
                            </div>
                            {confirmResult.evaluation.aiJustification ? (
                                <div className='ca-detail-stat' style={{ gridColumn: '1 / -1' }}>
                                    <p className='ca-detail-stat-label'>AI justification</p>
                                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', fontWeight: 600, color: '#4a5878', lineHeight: 1.5 }}>
                                        {confirmResult.evaluation.aiJustification}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Action bar */}
            <div className='ca-action-bar ca-animate-up'>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#1a2345' }}>
                        {placeId ? 'Profile selected — ready to confirm' : 'Select a profile or proceed without one'}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500, color: '#8c98af' }}>
                        You can update the Google profile match at any time.
                    </p>
                </div>

                <button
                    type='button'
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className='ca-btn-primary'
                >
                    {isLoading ? (
                        <>
                            <span
                                style={{
                                    width: '1rem',
                                    height: '1rem',
                                    borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.35)',
                                    borderTopColor: '#fff',
                                    animation: 'spin-smooth 0.75s linear infinite',
                                    display: 'inline-block',
                                }}
                            />
                            Confirming…
                        </>
                    ) : (
                        <>
                            Confirm match &amp; evaluate
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </div>
        </>
    )
}

export default ConfirmHotelMatchPage
