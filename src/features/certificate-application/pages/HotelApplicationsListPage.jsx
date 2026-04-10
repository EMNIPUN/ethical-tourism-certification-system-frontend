import { Award, ArrowRight, Building2, Globe, Plus, Star, TrendingUp } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AsyncState from '../components/AsyncState'
import {
    selectHotelApplications,
    selectHotelApplicationsError,
    selectHotelApplicationsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotels } from '../store/certificateApplicationSlice'

function certBadgeClass(level) {
    switch ((level || '').toLowerCase()) {
        case 'bronze':   return 'ca-cert-badge ca-cert-badge--bronze'
        case 'silver':   return 'ca-cert-badge ca-cert-badge--silver'
        case 'gold':     return 'ca-cert-badge ca-cert-badge--gold'
        case 'platinum': return 'ca-cert-badge ca-cert-badge--platinum'
        default:         return 'ca-cert-badge ca-cert-badge--none'
    }
}

function HotelCard({ hotel, index }) {
    const name        = hotel?.businessInfo?.name || 'Untitled Property'
    const type        = hotel?.businessInfo?.businessType || 'Hotel'
    const status      = hotel?.scoring?.certificationLevel || 'None'
    const googleScore = hotel?.scoring?.googleReviewScore
    const dataScore   = hotel?.scoring?.dataCompletionScore
    const hasMatch    = Boolean(hotel?.googleMapsData?.placeId)

    return (
        <Link
            to={`/certificate-application/${hotel?._id}`}
            className='ca-hotel-card ca-animate-up'
            style={{ animationDelay: `${index * 60}ms` }}
            aria-label={`View details for ${name}`}
        >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    <div
                        style={{
                            width: '2.8rem',
                            height: '2.8rem',
                            borderRadius: '0.85rem',
                            background: 'linear-gradient(140deg, rgba(88,104,216,0.14), rgba(88,104,216,0.06))',
                            border: '1px solid rgba(88,104,216,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#5868d8',
                            flexShrink: 0,
                        }}
                    >
                        <Building2 size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p className='ca-hotel-name' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {name}
                        </p>
                        <p className='ca-hotel-type'>{type}</p>
                    </div>
                </div>
                <span className={certBadgeClass(status)} style={{ flexShrink: 0 }}>
                    <Award size={11} />
                    {status}
                </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(207,216,230,0.6)', margin: '1rem 0' }} />

            {/* Metrics row */}
            <div className='ca-hotel-meta'>
                {typeof googleScore === 'number' ? (
                    <span className='ca-meta-chip'>
                        <Star size={11} strokeWidth={2.5} />
                        {googleScore.toFixed(1)} Google
                    </span>
                ) : null}
                {typeof dataScore === 'number' ? (
                    <span className='ca-meta-chip'>
                        <TrendingUp size={11} strokeWidth={2.5} />
                        {Math.round(dataScore)}% Complete
                    </span>
                ) : null}
                {hasMatch ? (
                    <span className='ca-meta-chip' style={{ color: '#1f6c44', borderColor: 'rgba(31,108,68,0.25)', background: 'rgba(31,108,68,0.07)' }}>
                        <Globe size={11} strokeWidth={2.5} />
                        Match confirmed
                    </span>
                ) : (
                    <span className='ca-meta-chip' style={{ color: '#92620a', borderColor: 'rgba(180,120,20,0.25)', background: 'rgba(180,120,20,0.07)' }}>
                        Match pending
                    </span>
                )}

                <span className='ca-hotel-cta'>
                    View details <ArrowRight size={15} strokeWidth={2.5} />
                </span>
            </div>
        </Link>
    )
}

function HotelApplicationsListPage() {
    const dispatch = useDispatch()
    const hotels   = useSelector(selectHotelApplications)
    const status   = useSelector(selectHotelApplicationsStatus)
    const error    = useSelector(selectHotelApplicationsError)

    const loadHotels = useCallback(() => {
        dispatch(fetchHotels({ page: 1, limit: 50, sort: '-createdAt' }))
    }, [dispatch])

    useEffect(() => { loadHotels() }, [loadHotels])

    // Aggregate stats
    const total    = hotels?.length || 0
    const certified = hotels?.filter(h => h?.scoring?.certificationLevel && h.scoring.certificationLevel !== 'None').length || 0
    const matched  = hotels?.filter(h => Boolean(h?.googleMapsData?.placeId)).length || 0
    const avgScore = hotels?.length
        ? (hotels.reduce((sum, h) => sum + (h?.scoring?.googleReviewScore || 0), 0) / hotels.length).toFixed(1)
        : '—'

    return (
        <>
            {/* Hero header */}
            <header className='ca-hero ca-animate-up'>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div>
                        <span className='ca-hero-eyebrow'>
                            <Award size={11} strokeWidth={3} />
                            Certificate Applications
                        </span>
                        <h1 className='ca-hero-title'>Your Hotel Applications</h1>
                        <p className='ca-hero-desc'>
                            Create applications, confirm Google profile matches, and track your certification status.
                        </p>
                    </div>
                    <Link to='/certificate-application/new' className='ca-btn-primary'>
                        <Plus size={16} strokeWidth={2.5} />
                        New application
                    </Link>
                </div>
            </header>

            {/* Stats row */}
            {total > 0 ? (
                <div className='ca-stats-row ca-animate-up-1'>
                    <div className='ca-stat-card'>
                        <div className='ca-stat-icon ca-stat-icon--blue'>
                            <Building2 size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className='ca-stat-value'>{total}</p>
                            <p className='ca-stat-label'>Total applications</p>
                        </div>
                    </div>
                    <div className='ca-stat-card'>
                        <div className='ca-stat-icon ca-stat-icon--green'>
                            <Award size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className='ca-stat-value'>{certified}</p>
                            <p className='ca-stat-label'>Certified</p>
                        </div>
                    </div>
                    <div className='ca-stat-card'>
                        <div className='ca-stat-icon ca-stat-icon--amber'>
                            <Globe size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className='ca-stat-value'>{matched}</p>
                            <p className='ca-stat-label'>Google matched</p>
                        </div>
                    </div>
                    <div className='ca-stat-card'>
                        <div className='ca-stat-icon ca-stat-icon--purple'>
                            <Star size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <p className='ca-stat-value'>{avgScore}</p>
                            <p className='ca-stat-label'>Avg. Google score</p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* List */}
            <AsyncState
                status={status}
                error={error}
                loadingMessage='Loading your applications…'
                onRetry={loadHotels}
                retryLabel='Reload'
            >
                {hotels?.length ? (
                    <div
                        className='ca-animate-up-2'
                        style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
                    >
                        {hotels.map((hotel, i) => (
                            <HotelCard key={hotel._id} hotel={hotel} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className='ca-empty ca-animate-scale'>
                        <div className='ca-empty-icon'>
                            <Building2 size={28} strokeWidth={1.5} />
                        </div>
                        <p className='ca-empty-title'>No applications yet</p>
                        <p className='ca-empty-desc'>
                            Start by creating your first hotel application and uploading supporting documents to begin the certification process.
                        </p>
                        <Link to='/certificate-application/new' className='ca-btn-primary' style={{ marginTop: '0.75rem' }}>
                            <Plus size={16} strokeWidth={2.5} />
                            Create first application
                        </Link>
                    </div>
                )}
            </AsyncState>
        </>
    )
}

export default HotelApplicationsListPage
