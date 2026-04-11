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
    selectCandidateSearchError,
    selectCandidateSearchHotelId,
    selectCandidateSearchItems,
    selectCandidateSearchStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotel, fetchHotelCandidates, submitConfirmMatch } from '../store/certificateApplicationSlice'

function ConfirmHotelMatchPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const createResult = useSelector(selectCreateResult)
    const confirmStatus = useSelector(selectConfirmStatus)
    const confirmError = useSelector(selectConfirmError)
    const confirmResult = useSelector(selectConfirmResult)

    const hotel = useSelector(selectHotelDetails)
    const hotelStatus = useSelector(selectHotelDetailsStatus)
    const hotelError = useSelector(selectHotelDetailsError)

    const candidateItems = useSelector(selectCandidateSearchItems)
    const candidateStatus = useSelector(selectCandidateSearchStatus)
    const candidateError = useSelector(selectCandidateSearchError)
    const candidateHotelId = useSelector(selectCandidateSearchHotelId)

    const candidates = useMemo(() => {
        if (candidateHotelId === id) {
            return candidateItems || []
        }

        if (createResult?.hotelId === id) {
            return createResult?.candidates || []
        }

        return []
    }, [candidateHotelId, candidateItems, createResult, id])

    const [placeId, setPlaceId] = useState('')
    const [thumbnail, setThumbnail] = useState('')

    const loadHotel = useCallback(() => { dispatch(fetchHotel(id)) }, [dispatch, id])
    useEffect(() => { loadHotel() }, [loadHotel])

    useEffect(() => {
        if (!id) return
        if (candidateStatus === 'loading') return
        if (candidateHotelId === id && (candidateItems?.length || 0) > 0) return

        if (hotelStatus === 'succeeded' && hotel?.businessInfo?.name) {
            dispatch(fetchHotelCandidates(id))
        }
    }, [candidateHotelId, candidateItems, candidateStatus, createResult, dispatch, hotel, hotelStatus, id])

    async function handleConfirm() {
        const resolved = placeId?.trim() ? placeId.trim() : null
        const action = await dispatch(submitConfirmMatch({ hotelId: id, placeId: resolved, thumbnail }))
        if (submitConfirmMatch.fulfilled.match(action)) {
            navigate(`/certificate-application/${id}`, { replace: true })
        }
    }

    const isLoading = confirmStatus === 'loading'

    return (
        <>
            {/* ── Premium Hero Header ─────────────────────────────────────────── */}
            <header className='ca-animate-up' style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '3rem 3.5rem',
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                marginBottom: '1rem'
            }}>
                {/* Background glowing effects */}
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(88,104,216,0.12) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />

                {/* Abstract grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
                    <div style={{ maxWidth: '650px' }}>
                        {/* Breadcrumb */}
                        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                            <Link to='/certificate-application' style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', textDecoration: 'none' }}>Applications</Link>
                            <ChevronRight size={12} strokeWidth={3} style={{ color: '#475569' }} />
                            <Link to={`/certificate-application/${id}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', textDecoration: 'none' }}>Details</Link>
                            <ChevronRight size={12} strokeWidth={3} style={{ color: '#475569' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>Confirm match</span>
                        </nav>

                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            <MapPin size={13} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            Step 2 — Google Profile Match
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 1rem 0', color: '#f8fafc' }}>
                            Confirm Google Business profile
                        </h1>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#94a3b8', margin: 0, fontWeight: 400 }}>
                            Select the correct listing to enable accurate review-based scoring for your certification.
                        </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                        <Link
                            to={`/certificate-application/${id}`}
                            className='ca-btn-secondary'
                            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', height: '2.8rem', padding: '0 1.25rem', borderRadius: '0.85rem' }}
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            Back to details
                        </Link>
                    </div>
                </div>
            </header>

            {/* Error banner */}
            {confirmError ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <AlertTriangle size={16} strokeWidth={2.2} className='ca-banner-icon' />
                    <p className='ca-banner-text'>{confirmError}</p>
                </div>
            ) : null}

            {candidateError && candidates.length === 0 ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <AlertTriangle size={16} strokeWidth={2.2} className='ca-banner-icon' />
                    <p className='ca-banner-text'>{candidateError}</p>
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
                <div className='ca-section-card ca-animate-up-1' style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
                    <div className='ca-section-header'>
                        <div className='ca-section-icon' style={{ background: 'rgba(88,104,216,0.1)', color: '#5868d8' }}>
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
                <div className='ca-section-card ca-animate-scale' style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
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
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.09em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                            }}
                        >
                            <CheckCircle2 size={13} strokeWidth={2.5} />
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
                    style={{ background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)', border: 'none', color: '#fff', padding: '0 1.5rem', height: '2.8rem', borderRadius: '0.85rem' }}
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
                            Confirm match & evaluate
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </div>
        </>
    )
}

export default ConfirmHotelMatchPage
