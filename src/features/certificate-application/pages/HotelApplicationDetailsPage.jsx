import {
    ArrowLeft,
    Award,
    Building2,
    CheckCircle2,
    ChevronRight,
    Globe,
    Mail,
    Phone,
    Pencil,
    Trash2,
    TrendingUp,
    Star,
} from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import {
    selectDeleteError,
    selectDeleteStatus,
    selectHotelDetails,
    selectHotelDetailsError,
    selectHotelDetailsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotel, submitHotelDelete } from '../store/certificateApplicationSlice'

function certColor(level) {
    switch ((level || '').toLowerCase()) {
        case 'bronze':   return { bg: 'rgba(180,120,50,0.1)',  text: '#7a4d12', border: 'rgba(180,120,50,0.25)' }
        case 'silver':   return { bg: 'rgba(100,120,150,0.1)', text: '#3d5068', border: 'rgba(100,120,150,0.25)' }
        case 'gold':     return { bg: 'rgba(200,165,20,0.1)',  text: '#7a6108', border: 'rgba(200,165,20,0.25)' }
        case 'platinum': return { bg: 'rgba(88,104,216,0.1)',  text: '#3a46a8', border: 'rgba(88,104,216,0.25)' }
        default:         return { bg: 'rgba(140,152,175,0.1)', text: '#5d6a82', border: 'rgba(140,152,175,0.25)' }
    }
}

function HotelApplicationDetailsPage() {
    const { id }     = useParams()
    const dispatch   = useDispatch()
    const navigate   = useNavigate()

    const hotel       = useSelector(selectHotelDetails)
    const status      = useSelector(selectHotelDetailsStatus)
    const error       = useSelector(selectHotelDetailsError)
    const deleteStatus = useSelector(selectDeleteStatus)
    const deleteError  = useSelector(selectDeleteError)

    const loadHotel = useCallback(() => { dispatch(fetchHotel(id)) }, [dispatch, id])
    useEffect(() => { loadHotel() }, [loadHotel])

    async function handleDelete() {
        const confirmed = window.confirm('Permanently delete this application? This action cannot be undone.')
        if (!confirmed) return
        const action = await dispatch(submitHotelDelete({ hotelId: id }))
        if (submitHotelDelete.fulfilled.match(action)) {
            navigate('/certificate-application', { replace: true })
        }
    }

    const hasPlaceId = Boolean(hotel?.googleMapsData?.placeId)
    const thumbnail  = hotel?.googleMapsData?.thumbnail
    const certLevel  = hotel?.scoring?.certificationLevel || 'None'
    const certStyle  = certColor(certLevel)

    return (
        <>
            {/* Hero header */}
            <header className='ca-hero ca-animate-up' style={{ padding: 0, overflow: 'hidden' }}>
                {/* Cover photo banner */}
                {thumbnail ? (
                    <div style={{
                        height: '11rem',
                        background: `linear-gradient(to bottom, rgba(26,35,69,0.15), rgba(26,35,69,0.55)), url('${thumbnail}') center/cover no-repeat`,
                        position: 'relative',
                    }} />
                ) : null}

                <div style={{ padding: 'clamp(1.4rem, 3vw, 2rem)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem' }}>
                    <div>
                        {/* Breadcrumb */}
                        <Link
                            to='/certificate-application'
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#7b88a6',
                                textDecoration: 'none',
                                transition: 'color 160ms ease',
                                marginBottom: '0.65rem',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#5868d8')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#7b88a6')}
                        >
                            <ArrowLeft size={13} strokeWidth={2.5} />
                            All applications
                            <ChevronRight size={12} strokeWidth={2.5} style={{ opacity: 0.5 }} />
                            <span style={{ color: '#1a2345' }}>Details</span>
                        </Link>

                        <span className='ca-hero-eyebrow'>
                            <Award size={11} strokeWidth={3} />
                            Application Details
                        </span>
                        <h1 className='ca-hero-title' style={{ fontSize: 'clamp(1.5rem,3vw,2.1rem)' }}>
                            {hotel?.businessInfo?.name || 'Application details'}
                        </h1>
                        <p className='ca-hero-desc' style={{ marginTop: '0.4rem' }}>
                            {hotel?.businessInfo?.contact?.address || '—'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to={`/certificate-application/${id}/edit`} className='ca-btn-secondary'>
                            <Pencil size={14} strokeWidth={2.5} />
                            Edit
                        </Link>
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={deleteStatus === 'loading'}
                            className='ca-btn-danger'
                        >
                            <Trash2 size={14} strokeWidth={2.5} />
                            {deleteStatus === 'loading' ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
                </div>
            </header>

            {/* Delete error banner */}
            {deleteError ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <p className='ca-banner-text'>{deleteError}</p>
                </div>
            ) : null}

            <AsyncState
                status={status}
                error={error}
                loadingMessage='Loading application details…'
                onRetry={loadHotel}
                retryLabel='Reload'
            >
                {hotel ? (
                    <div style={{ display: 'grid', gap: '1.25rem' }} className='ca-animate-up-1'>

                        {/* Scoring stat cards */}
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                            {/* Cert level */}
                            <div className='ca-detail-stat' style={{ borderTop: `3px solid ${certStyle.border}` }}>
                                <div
                                    style={{
                                        width: '2.2rem',
                                        height: '2.2rem',
                                        borderRadius: '0.65rem',
                                        background: certStyle.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: certStyle.text,
                                        marginBottom: '0.4rem',
                                    }}
                                >
                                    <Award size={16} strokeWidth={2} />
                                </div>
                                <p className='ca-detail-stat-label'>Certification level</p>
                                <p className='ca-detail-stat-value' style={{ fontSize: '1.2rem', color: certStyle.text }}>{certLevel}</p>
                            </div>

                            {/* Google score */}
                            <div className='ca-detail-stat'>
                                <div
                                    style={{
                                        width: '2.2rem',
                                        height: '2.2rem',
                                        borderRadius: '0.65rem',
                                        background: 'rgba(249,186,20,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#b8860b',
                                        marginBottom: '0.4rem',
                                    }}
                                >
                                    <Star size={16} strokeWidth={2} />
                                </div>
                                <p className='ca-detail-stat-label'>Google review score</p>
                                <p className='ca-detail-stat-value'>
                                    {typeof hotel?.scoring?.googleReviewScore === 'number'
                                        ? hotel.scoring.googleReviewScore.toFixed(1)
                                        : '—'}
                                </p>
                            </div>

                            {/* Data completion */}
                            <div className='ca-detail-stat'>
                                <div
                                    style={{
                                        width: '2.2rem',
                                        height: '2.2rem',
                                        borderRadius: '0.65rem',
                                        background: 'rgba(88,104,216,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#5868d8',
                                        marginBottom: '0.4rem',
                                    }}
                                >
                                    <TrendingUp size={16} strokeWidth={2} />
                                </div>
                                <p className='ca-detail-stat-label'>Data completion</p>
                                <p className='ca-detail-stat-value'>
                                    {typeof hotel?.scoring?.dataCompletionScore === 'number'
                                        ? `${Math.round(hotel.scoring.dataCompletionScore)}%`
                                        : '—'}
                                </p>
                            </div>

                            {/* Google match status */}
                            <div className='ca-detail-stat' style={{ borderTop: `3px solid ${hasPlaceId ? 'rgba(31,108,68,0.3)' : 'rgba(200,140,20,0.3)'}` }}>
                                <div
                                    style={{
                                        width: '2.2rem',
                                        height: '2.2rem',
                                        borderRadius: '0.65rem',
                                        background: hasPlaceId ? 'rgba(31,108,68,0.1)' : 'rgba(200,140,20,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: hasPlaceId ? '#1f6c44' : '#92620a',
                                        marginBottom: '0.4rem',
                                    }}
                                >
                                    <Globe size={16} strokeWidth={2} />
                                </div>
                                <p className='ca-detail-stat-label'>Google profile</p>
                                <p
                                    className='ca-detail-stat-value'
                                    style={{ fontSize: '0.95rem', color: hasPlaceId ? '#1f6c44' : '#92620a' }}
                                >
                                    {hasPlaceId ? 'Confirmed' : 'Pending'}
                                </p>
                            </div>
                        </div>

                        {/* Workflow card */}
                        <div className='ca-section-card'>
                            <div className='ca-section-header'>
                                <div className='ca-section-icon'>
                                    <CheckCircle2 size={18} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className='ca-section-title'>Certification workflow</p>
                                    <p className='ca-section-desc'>Steps to complete certification for this property.</p>
                                </div>
                            </div>
                            <div className='ca-section-body'>
                                {/* Timeline steps */}
                                <div>
                                    <div className='ca-workflow-step'>
                                        <div className='ca-workflow-dot ca-workflow-dot--done' />
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1a2345' }}>Application submitted</p>
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', fontWeight: 500, color: '#8c98af' }}>Hotel details and documents uploaded.</p>
                                        </div>
                                    </div>
                                    <div className='ca-workflow-step'>
                                        <div className={`ca-workflow-dot ${hasPlaceId ? 'ca-workflow-dot--done' : 'ca-workflow-dot--current'}`} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1a2345' }}>
                                                {hasPlaceId ? 'Google profile confirmed' : 'Confirm Google profile'}
                                            </p>
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', fontWeight: 500, color: '#8c98af' }}>
                                                {hasPlaceId
                                                    ? 'Profile matched — review scoring is active.'
                                                    : 'Match the hotel to its Google Business listing to enable review scoring.'}
                                            </p>
                                            {!hasPlaceId ? (
                                                <Link
                                                    to={`/certificate-application/${id}/confirm-match`}
                                                    className='ca-btn-primary'
                                                    style={{ marginTop: '0.75rem', width: 'fit-content', height: '2.4rem', fontSize: '0.8rem' }}
                                                >
                                                    Confirm match now
                                                    <ChevronRight size={14} strokeWidth={2.5} />
                                                </Link>
                                            ) : null}
                                        </div>
                                        {hasPlaceId ? (
                                            <Link
                                                to={`/certificate-application/${id}/confirm-match`}
                                                className='ca-btn-secondary'
                                                style={{ fontSize: '0.78rem', height: '2.4rem', flexShrink: 0 }}
                                            >
                                                Re-confirm
                                            </Link>
                                        ) : null}
                                    </div>
                                    <div className='ca-workflow-step'>
                                        <div className={`ca-workflow-dot ${hasPlaceId && certLevel !== 'None' ? 'ca-workflow-dot--done' : 'ca-workflow-dot--pending'}`} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: hasPlaceId ? '#1a2345' : '#8c98af' }}>
                                                Certificate management
                                            </p>
                                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', fontWeight: 500, color: '#8c98af' }}>
                                                Review scores and proceed through the certification lifecycle.
                                            </p>
                                        </div>
                                        {hasPlaceId ? (
                                            <Link
                                                to='/certificate-management'
                                                className='ca-btn-secondary'
                                                style={{ fontSize: '0.78rem', height: '2.4rem', flexShrink: 0 }}
                                            >
                                                Open
                                                <ChevronRight size={14} strokeWidth={2.5} />
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact section */}
                        <div className='ca-section-card'>
                            <div className='ca-section-header'>
                                <div className='ca-section-icon'>
                                    <Building2 size={18} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className='ca-section-title'>Contact information</p>
                                    <p className='ca-section-desc'>Owner and property contact details.</p>
                                </div>
                            </div>
                            <div className='ca-section-body'>
                                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                                    <div className='ca-contact-item'>
                                        <div className='ca-contact-label'>Owner</div>
                                        <div className='ca-contact-value'>
                                            {hotel?.businessInfo?.contact?.ownerName || '—'}
                                        </div>
                                    </div>
                                    <div className='ca-contact-item'>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Mail size={12} strokeWidth={2.5} style={{ color: '#5868d8' }} />
                                            <span className='ca-contact-label'>Email</span>
                                        </div>
                                        <div className='ca-contact-value'>{hotel?.businessInfo?.contact?.email || '—'}</div>
                                    </div>
                                    <div className='ca-contact-item'>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Phone size={12} strokeWidth={2.5} style={{ color: '#5868d8' }} />
                                            <span className='ca-contact-label'>Phone</span>
                                        </div>
                                        <div className='ca-contact-value'>{hotel?.businessInfo?.contact?.phone || '—'}</div>
                                    </div>
                                    <div className='ca-contact-item'>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Globe size={12} strokeWidth={2.5} style={{ color: '#5868d8' }} />
                                            <span className='ca-contact-label'>Website</span>
                                        </div>
                                        <div className='ca-contact-value'>{hotel?.businessInfo?.contact?.website || '—'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='ca-empty ca-animate-scale'>
                        <div className='ca-empty-icon'>
                            <Building2 size={28} strokeWidth={1.5} />
                        </div>
                        <p className='ca-empty-title'>Application not found</p>
                        <p className='ca-empty-desc'>This application may have been deleted or the link is invalid.</p>
                        <Link to='/certificate-application' className='ca-btn-primary' style={{ marginTop: '0.75rem' }}>
                            <ArrowLeft size={15} strokeWidth={2.5} />
                            Back to applications
                        </Link>
                    </div>
                )}
            </AsyncState>
        </>
    )
}

export default HotelApplicationDetailsPage
