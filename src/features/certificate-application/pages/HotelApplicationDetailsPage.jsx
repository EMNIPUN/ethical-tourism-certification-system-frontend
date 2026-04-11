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

/** Upgrade Google CDN thumbnail to higher resolution by replacing size params */
function upgradeGoogleImageUrl(url, width = 1200) {
    if (!url) return url
    return url
        .replace(/=w\d+-h\d+(-[^=]*)?$/, `=w${width}-h${Math.round(width * 0.66)}-k-no`)
        .replace(/=s\d+(-[^=]*)?$/,      `=w${width}-h${Math.round(width * 0.66)}-k-no`)
}

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
    const thumbnail  = upgradeGoogleImageUrl(hotel?.googleMapsData?.thumbnail, 1200)
    const certLevel  = hotel?.scoring?.certificationLevel || 'None'
    const certStyle  = certColor(certLevel)

    return (
        <>
            {/* Hero header */}
            <header className='ca-hero ca-animate-up' style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                {/* Cover photo banner */}
                <div style={{
                    height: thumbnail ? '18rem' : '8rem',
                    background: thumbnail
                        ? `url('${thumbnail}') center/cover no-repeat`
                        : 'linear-gradient(135deg, rgba(88,104,216,0.12), rgba(88,104,216,0.03))',
                    position: 'relative',
                    borderRadius: '1.75rem',
                    overflow: 'hidden',
                }}>
                    {thumbnail ? (
                        <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            background: 'linear-gradient(180deg, rgba(30,42,80,0.4) 0%, rgba(30,42,80,0.1) 40%, rgba(240,244,252,1) 100%)' 
                        }} />
                    ) : null}
                </div>

                {/* Overlapping Glass Card */}
                <div style={{ 
                    padding: '0 clamp(1.5rem, 3vw, 2rem)', 
                    position: 'relative', 
                    zIndex: 1, 
                    marginTop: thumbnail ? '-6.5rem' : '-4rem',
                    marginBottom: '0.5rem',
                }}>
                    <div style={{ 
                        background: 'rgba(255,255,255,0.85)', 
                        backdropFilter: 'blur(20px) saturate(180%)', 
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderRadius: '1.4rem', 
                        padding: '1.8rem 2rem', 
                        boxShadow: '0 12px 32px -12px rgba(30,42,80,0.15), 0 0 0 1px rgba(255,255,255,0.7) inset',
                        border: '1px solid rgba(207,216,230,0.65)',
                        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' 
                    }}>
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
                                    marginBottom: '0.8rem',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#5868d8')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#7b88a6')}
                            >
                                <ArrowLeft size={13} strokeWidth={2.5} />
                                All applications
                                <ChevronRight size={12} strokeWidth={2.5} style={{ opacity: 0.5 }} />
                                <span style={{ color: '#1a2345' }}>Details</span>
                            </Link>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <span className='ca-hero-eyebrow' style={{ background: '#fff', boxShadow: '0 2px 8px rgba(30,42,80,0.05)' }}>
                                    <Award size={11} strokeWidth={3} />
                                    Application Details
                                </span>
                            </div>
                            <h1 className='ca-hero-title' style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>
                                {hotel?.businessInfo?.name || 'Application details'}
                            </h1>
                            <p className='ca-hero-desc' style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                {hotel?.businessInfo?.contact?.address || '—'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Link to={`/certificate-application/${id}/edit`} className='ca-btn-secondary' style={{ background: '#fff' }}>
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
                        <div className='ca-stats-row'>
                            {/* Cert level */}
                            <div className='ca-stat-card' style={{ borderBottom: `4px solid ${certStyle.border.replace('0.25', '0.6')}` }}>
                                <div className='ca-stat-icon' style={{ background: certStyle.bg, color: certStyle.text }}>
                                    <Award size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className='ca-stat-value' style={{ color: certStyle.text }}>{certLevel}</p>
                                    <p className='ca-stat-label'>Certification level</p>
                                </div>
                            </div>

                            {/* Google score */}
                            <div className='ca-stat-card'>
                                <div className='ca-stat-icon ca-stat-icon--amber'>
                                    <Star size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className='ca-stat-value'>
                                        {typeof hotel?.scoring?.googleReviewScore === 'number'
                                            ? hotel.scoring.googleReviewScore.toFixed(1)
                                            : '—'}
                                    </p>
                                    <p className='ca-stat-label'>Google review score</p>
                                </div>
                            </div>

                            {/* Data completion */}
                            <div className='ca-stat-card'>
                                <div className='ca-stat-icon ca-stat-icon--blue'>
                                    <TrendingUp size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className='ca-stat-value'>
                                        {typeof hotel?.scoring?.dataCompletionScore === 'number'
                                            ? `${Math.round(hotel.scoring.dataCompletionScore)}%`
                                            : '—'}
                                    </p>
                                    <p className='ca-stat-label'>Data completion</p>
                                </div>
                            </div>

                            {/* Google match status */}
                            <div className='ca-stat-card' style={{ borderBottom: `4px solid ${hasPlaceId ? 'rgba(31,108,68,0.45)' : 'rgba(200,140,20,0.45)'}` }}>
                                <div className={`ca-stat-icon ${hasPlaceId ? 'ca-stat-icon--green' : 'ca-stat-icon--amber'}`}>
                                    <Globe size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p className='ca-stat-value' style={{ fontSize: '1.25rem', color: hasPlaceId ? '#1f6c44' : '#92620a' }}>
                                        {hasPlaceId ? 'Confirmed' : 'Pending'}
                                    </p>
                                    <p className='ca-stat-label'>Google profile</p>
                                </div>
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
                                        <div className='ca-contact-value' style={{ marginTop: '0.4rem' }}>
                                            {hotel?.businessInfo?.contact?.website ? (
                                                <a 
                                                    href={hotel.businessInfo.contact.website.startsWith('http') ? hotel.businessInfo.contact.website : `https://${hotel.businessInfo.contact.website}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="ca-btn-secondary"
                                                    style={{ display: 'inline-flex', padding: '0 0.8rem', height: '2.1rem', fontSize: '0.75rem', gap: '0.3rem', width: 'fit-content', textDecoration: 'none' }}
                                                >
                                                    Visit Website
                                                    <ChevronRight size={12} strokeWidth={2.5} style={{ opacity: 0.6 }} />
                                                </a>
                                            ) : '—'}
                                        </div>
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
