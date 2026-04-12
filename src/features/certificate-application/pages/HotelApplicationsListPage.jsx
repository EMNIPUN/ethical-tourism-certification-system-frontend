import {
    Award,
    ArrowRight,
    Building2,
    ChevronLeft,
    ChevronRight,
    Globe,
    Plus,
    Search,
    SlidersHorizontal,
    Star,
    TrendingUp,
    X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AsyncState from '../components/AsyncState'
import {
    selectHotelApplications,
    selectHotelApplicationsCount,
    selectHotelApplicationsError,
    selectHotelApplicationsStatus,
    selectHotelListQuery,
} from '../store/certificateApplicationSelectors'
import { fetchHotels, setHotelsQuery } from '../store/certificateApplicationSlice'

/** Upgrade Google CDN thumbnail to higher resolution by replacing size params */
function upgradeGoogleImageUrl(url, width = 600) {
    if (!url) return url
    const normalized = String(url)
        .trim()
        .replace(/^http:\/\//i, 'https://')
        .replace(/^\/\//, 'https://')

    return normalized
        .replace(/=w\d+-h\d+(-[^=]*)?$/, `=w${width}-h${Math.round(width * 0.66)}-k-no`)
        .replace(/=s\d+(-[^=]*)?$/,      `=w${width}-h${Math.round(width * 0.66)}-k-no`)
}

/* ── Constants ───────────────────────────────────────────────────── */
const PAGE_SIZE    = 10
const SORT_OPTIONS = [
    { label: 'Newest first',     value: '-createdAt' },
    { label: 'Oldest first',     value: 'createdAt' },
    { label: 'Name (A–Z)',       value: 'businessInfo.name' },
    { label: 'Name (Z–A)',       value: '-businessInfo.name' },
    { label: 'Top Google score', value: '-scoring.googleReviewScore' },
]
const TYPE_OPTIONS = ['Hotel', 'Resort', 'Lodge', 'Guesthouse']
const CERT_OPTIONS = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum']

/* ── Helpers ─────────────────────────────────────────────────────── */
function getCertColors(level) {
    switch ((level || '').toLowerCase()) {
        case 'bronze':   return { color: '#92400e', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: 'rgba(217,119,6,0.3)' }
        case 'silver':   return { color: '#334155', bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: 'rgba(148,163,184,0.3)' }
        case 'gold':     return { color: '#b45309', bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: 'rgba(245,158,11,0.5)' }
        case 'platinum': return { color: '#0f172a', bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', border: 'rgba(100,116,139,0.5)' }
        default:         return { color: '#64748b', bg: '#f8fafc', border: 'rgba(203,213,225,0.8)' }
    }
}

/* ── Hotel Card ──────────────────────────────────────────────────── */
function HotelCard({ hotel, index }) {
    const name        = hotel?.businessInfo?.name || 'Untitled Property'
    const type        = hotel?.businessInfo?.businessType || 'Hotel'
    const certLevel   = hotel?.scoring?.certificationLevel || 'None'
    const googleScore = hotel?.scoring?.googleReviewScore
    const dataScore   = hotel?.scoring?.dataCompletionScore
    const hasMatch    = Boolean(hotel?.googleMapsData?.placeId)
    const [imageFailed, setImageFailed] = useState(false)
    const thumbnail = useMemo(() => {
        if (imageFailed) return ''
        return upgradeGoogleImageUrl(hotel?.googleMapsData?.thumbnail, 600)
    }, [hotel?.googleMapsData?.thumbnail, imageFailed])
    
    const badgeColors = getCertColors(certLevel)

    return (
        <Link
            to={`/certificate-application/${hotel?._id}`}
            className='ca-animate-up'
            style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                animationDelay: `${index * 40}ms`,
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid rgba(226,232,240,0.8)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(88,104,216,0.15)';
                e.currentTarget.style.borderColor = 'rgba(88,104,216,0.3)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px -10px rgba(15,23,42,0.05)';
                e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)';
            }}
        >
            {/* Cover image */}
            <div style={{
                height: '11rem',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt=''
                        loading='lazy'
                        referrerPolicy='no-referrer'
                        crossOrigin='anonymous'
                        onError={() => setImageFailed(true)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : null}
                {thumbnail && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)' }} />}
                {!thumbnail && <Building2 size={36} strokeWidth={1} style={{ color: '#94a3b8' }} />}
                
                <span style={{ 
                    position: 'absolute', top: '1rem', right: '1rem', 
                    background: badgeColors.bg, color: badgeColors.color, border: `1px solid ${badgeColors.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '0.4rem 0.85rem', 
                    borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.4rem', 
                    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                    <Award size={14} style={{ opacity: certLevel === 'None' ? 0.6 : 1 }} strokeWidth={2.5} />
                    {certLevel}
                </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, marginBottom: '0.85rem' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
                            {name}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {type}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {typeof googleScore === 'number' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#b45309', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.25rem 0.6rem', borderRadius: '0.4rem' }}>
                            <Star size={12} strokeWidth={2.5} fill="currentColor" />{googleScore.toFixed(1)}
                        </span>
                    )}
                    {typeof dataScore === 'number' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', padding: '0.25rem 0.6rem', borderRadius: '0.4rem' }}>
                            <TrendingUp size={12} strokeWidth={2.5} />{Math.round(dataScore)}% set up
                        </span>
                    )}
                    {hasMatch ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.25rem 0.6rem', borderRadius: '0.4rem' }}>
                            <Globe size={12} strokeWidth={2.5} />Matched
                        </span>
                    ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', padding: '0.25rem 0.6rem', borderRadius: '0.4rem' }}>
                            <Globe size={12} strokeWidth={2.5} />Unmatched
                        </span>
                    )}
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(226,232,240,0.5) 0%, rgba(226,232,240,1) 50%, rgba(226,232,240,0.5) 100%)', margin: '0 0 1rem 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#5868d8', fontSize: '0.85rem', fontWeight: 700, transition: 'gap 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.gap = '0.75rem'}
                     onMouseLeave={e => e.currentTarget.style.gap = '0.5rem'}
                >
                    View application details <ArrowRight size={14} strokeWidth={3} />
                </div>
            </div>
        </Link>
    )
}

/* ── Skeleton card ───────────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', overflow: 'hidden' }}>
            <div className='ca-skeleton' style={{ height: '11rem', borderRadius: 0 }} />
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.85rem' }}>
                <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
                    <div className='ca-skeleton' style={{ height: '1rem', width: '60%', borderRadius: '0.4rem' }} />
                    <div className='ca-skeleton' style={{ height: '0.8rem', width: '35%', borderRadius: '0.4rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                    {[55, 75, 70].map((w, i) => (
                        <div key={i} className='ca-skeleton' style={{ height: '1.8rem', width: `${w}px`, borderRadius: '0.4rem' }} />
                    ))}
                </div>
                <div className='ca-skeleton' style={{ height: '1px', borderRadius: '999px', margin: '0.2rem 0' }} />
                <div className='ca-skeleton' style={{ height: '1rem', width: '40%', margin: '0 auto', borderRadius: '0.4rem' }} />
            </div>
        </div>
    )
}

/* ── Pagination ──────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPrev, onNext, onGo }) {
    if (totalPages <= 1) return null

    const pages = []
    const delta = 2
    const left  = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    if (left > 1) { pages.push(1); if (left > 2) pages.push('…') }
    for (let p = left; p <= right; p++) pages.push(p)
    if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages) }

    const btnBase = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: '2.2rem', minWidth: '2.2rem', borderRadius: '0.65rem',
        border: '1.5px solid rgba(207,216,230,0.8)', background: 'rgba(255,255,255,0.95)',
        fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 160ms ease',
        fontFamily: 'inherit', padding: '0 0.5rem',
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button style={{ ...btnBase, color: page === 1 ? '#c0c8d8' : '#4a5878', cursor: page === 1 ? 'not-allowed' : 'pointer' }} disabled={page === 1} onClick={onPrev}>
                <ChevronLeft size={15} strokeWidth={2.5} />
            </button>
            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`e${i}`} style={{ fontSize: '0.82rem', color: '#8c98af', padding: '0 0.2rem' }}>…</span>
                ) : (
                    <button key={p} onClick={() => onGo(p)} style={{
                        ...btnBase,
                        background: p === page ? 'linear-gradient(135deg,#6372ec,#4a52c9)' : 'rgba(255,255,255,0.95)',
                        color: p === page ? '#fff' : '#4a5878',
                        borderColor: p === page ? 'transparent' : 'rgba(207,216,230,0.8)',
                        boxShadow: p === page ? '0 4px 12px -6px rgba(74,82,201,0.5)' : 'none',
                    }}>
                        {p}
                    </button>
                )
            )}
            <button style={{ ...btnBase, color: page === totalPages ? '#c0c8d8' : '#4a5878', cursor: page === totalPages ? 'not-allowed' : 'pointer' }} disabled={page === totalPages} onClick={onNext}>
                <ChevronRight size={15} strokeWidth={2.5} />
            </button>
        </div>
    )
}

/* ── Main page ───────────────────────────────────────────────────── */
function HotelApplicationsListPage() {
    const dispatch = useDispatch()

    // Redux store
    const hotels     = useSelector(selectHotelApplications)
    const count      = useSelector(selectHotelApplicationsCount)
    const status     = useSelector(selectHotelApplicationsStatus)
    const error      = useSelector(selectHotelApplicationsError)
    const savedQuery = useSelector(selectHotelListQuery)

    // Local UI state — INITIALISED from Redux so navigation restores filters
    const [page,       setPage]       = useState(() => savedQuery.page       || 1)
    const [sort,       setSort]       = useState(() => savedQuery.sort       || '-createdAt')
    const [search,     setSearch]     = useState(() => savedQuery.search     || '')
    const [typeFilter, setTypeFilter] = useState(() => savedQuery.typeFilter || '')
    const [certFilter, setCertFilter] = useState(() => savedQuery.certFilter || '')
    const [showFilter, setShowFilter] = useState(false)

    const debounceRef = useRef(null)

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

    /* ── Core fetch — only dispatches when parameters change ─── */
    const load = useCallback((overrides = {}) => {
        const p    = overrides.page       ?? page
        const s    = overrides.sort       ?? sort
        const q    = overrides.search     ?? search
        const type = overrides.typeFilter ?? typeFilter
        const cert = overrides.certFilter ?? certFilter

        // Persist query to Redux so it survives navigation
        dispatch(setHotelsQuery({ page: p, sort: s, search: q, typeFilter: type, certFilter: cert }))

        const filters = {}
        if (q)    filters.search                        = q
        if (type) filters['businessInfo.businessType']  = type
        if (cert) filters['scoring.certificationLevel'] = cert

        dispatch(fetchHotels({ page: p, limit: PAGE_SIZE, sort: s, filters }))
    }, [dispatch, page, sort, search, typeFilter, certFilter])

    /* ── On mount: skip fetch if data is already in store ───── */
    useEffect(() => {
        // 'succeeded' means we have fresh data for the stored query — restore it without a network call
        if (status === 'succeeded') return
        // 'idle' (initial or post-delete) or 'failed' → fetch
        load()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Handlers ─────────────────────────────────────────────── */
    function goToPage(p) {
        setPage(p)
        load({ page: p })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleSortChange(val) {
        setSort(val)
        setPage(1)
        load({ sort: val, page: 1 })
    }

    function handleSearchChange(val) {
        setSearch(val)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setPage(1)
            load({ search: val, page: 1 })
        }, 400)
    }

    function handleTypeChange(val) {
        setTypeFilter(val)
        setPage(1)
        load({ typeFilter: val, page: 1 })
    }

    function handleCertChange(val) {
        setCertFilter(val)
        setPage(1)
        load({ certFilter: val, page: 1 })
    }

    function clearAllFilters() {
        setSearch(''); setTypeFilter(''); setCertFilter('')
        setSort('-createdAt'); setPage(1)
        load({ search: '', typeFilter: '', certFilter: '', sort: '-createdAt', page: 1 })
    }

    const hasActiveFilters = search || typeFilter || certFilter || sort !== '-createdAt'
    const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end   = Math.min(page * PAGE_SIZE, count)

    return (
        <>
            {/* ── Hero ─────────────────────────────────────────── */}
            <header className='ca-animate-up' style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                padding: '3.5rem 4rem', 
                borderRadius: '1.5rem', 
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', 
                color: '#fff', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                marginBottom: '2.5rem'
            }}>
                {/* Background glowing effects */}
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(88,104,216,0.15) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                
                {/* Abstract grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2.5rem' }}>
                    <div style={{ maxWidth: '650px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            <Award size={13} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            Certificate Applications
                        </div>
                        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 1.25rem 0', color: '#f8fafc' }}>
                            Hotel Applications
                        </h1>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#94a3b8', margin: 0, fontWeight: 400 }}>
                            Create new applications, confirm Google profile matches, and track your certification progress globally across your entire portfolio.
                        </p>
                    </div>
                    
                    <div style={{ flexShrink: 0 }}>
                        <Link to='/certificate-application/new' 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '1.1rem 1.85rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(88,104,216,0.5)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid rgba(255,255,255,0.15)' }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 18px 35px -8px rgba(88,104,216,0.7)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(88,104,216,0.5)'; }}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                            New application
                        </Link>
                    </div>
                </div>
            </header>


            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* ── Toolbar ───────────────────────────────────────── */}
                <div className='ca-animate-up-1' style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 220px', position: 'relative' }}>
                        <Search size={15} strokeWidth={2.5} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#8c98af', pointerEvents: 'none' }} />
                        <input
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder='Search hotels…'
                            className='ca-input'
                            style={{ paddingLeft: '2.4rem', paddingRight: search ? '2.4rem' : '1rem' }}
                        />
                        {search ? (
                            <button onClick={() => handleSearchChange('')} style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8c98af', display: 'flex', padding: 0 }}>
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        ) : null}
                    </div>

                    {/* Sort */}
                    <select value={sort} onChange={e => handleSortChange(e.target.value)} className='ca-select' style={{ flex: '0 1 190px' }}>
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilter(v => !v)}
                        className={(showFilter || typeFilter || certFilter) ? 'ca-btn-primary' : 'ca-btn-secondary'}
                        style={{ height: '3rem', padding: '0 1rem', gap: '0.45rem' }}
                    >
                        <SlidersHorizontal size={14} strokeWidth={2.5} />
                        Filters
                        {(typeFilter || certFilter) ? (
                            <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 800 }}>
                                {[typeFilter, certFilter].filter(Boolean).length}
                            </span>
                        ) : null}
                    </button>

                    {/* Clear all */}
                    {hasActiveFilters ? (
                        <button onClick={clearAllFilters} className='ca-btn-secondary' style={{ height: '3rem', padding: '0 1rem', color: '#c0392b', borderColor: 'rgba(200,50,50,0.25)' }}>
                            <X size={14} strokeWidth={2.5} />Clear all
                        </button>
                    ) : null}
                </div>

                {/* Expanded filter panel */}
                {showFilter ? (
                    <div className='ca-animate-scale' style={{ borderRadius: '1.25rem', border: '1.5px solid rgba(88,104,216,0.2)', background: 'rgba(248,250,255,0.97)', padding: '1.1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: '1 1 170px' }}>
                            <label className='ca-field-label' style={{ marginBottom: '0.4rem' }}>Business type</label>
                            <select value={typeFilter} onChange={e => handleTypeChange(e.target.value)} className='ca-select'>
                                <option value=''>All types</option>
                                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: '1 1 170px' }}>
                            <label className='ca-field-label' style={{ marginBottom: '0.4rem' }}>Certification level</label>
                            <select value={certFilter} onChange={e => handleCertChange(e.target.value)} className='ca-select'>
                                <option value=''>All levels</option>
                                {CERT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                ) : null}

                {/* Results count */}
                {status !== 'loading' && count > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                            Showing <strong style={{ color: '#1a2345' }}>{start}–{end}</strong> of <strong style={{ color: '#1a2345' }}>{count}</strong> application{count !== 1 ? 's' : ''}
                        </p>
                        {totalPages > 1 ? (
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                                Page <strong style={{ color: '#1a2345' }}>{page}</strong> of <strong style={{ color: '#1a2345' }}>{totalPages}</strong>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* ── Card grid ─────────────────────────────────────── */}
            {status === 'loading' ? (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <AsyncState status={status} error={error} loadingMessage='Loading applications…' onRetry={() => load()} retryLabel='Reload'>
                    {hotels?.length ? (
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                            {hotels.map((hotel, i) => <HotelCard key={hotel._id} hotel={hotel} index={i} />)}
                        </div>
                    ) : (
                        <div className='ca-empty ca-animate-scale' style={{ padding: '4rem 2rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px dashed rgba(203,213,225,0.8)', textAlign: 'center' }}>
                            <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,104,216,0.1) 0%, rgba(88,104,216,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#5868d8' }}>
                                {hasActiveFilters ? <Search size={32} strokeWidth={2} /> : <Building2 size={32} strokeWidth={2} />}
                            </div>
                            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                {hasActiveFilters ? 'No results match your filters' : 'No applications yet'}
                            </h2>
                            <p style={{ margin: '0 auto 1.5rem auto', fontSize: '0.95rem', color: '#64748b', maxWidth: '350px', lineHeight: 1.6 }}>
                                {hasActiveFilters
                                    ? 'Try adjusting your search query or clearing the active filters to see more results.'
                                    : 'Start by creating your first hotel application to begin the ethical tourism certification process.'}
                            </p>
                            {hasActiveFilters ? (
                                <button onClick={clearAllFilters} className='ca-btn-secondary' style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '2.8rem', padding: '0 1.25rem', borderRadius: '0.8rem', fontWeight: 700 }}>
                                    <X size={16} strokeWidth={2.5} />Clear all filters
                                </button>
                            ) : (
                                <Link to='/certificate-application/new' className='ca-btn-primary' style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '2.8rem', padding: '0 1.25rem', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)' }}>
                                    <Plus size={16} strokeWidth={2.5} />Create first application
                                </Link>
                            )}
                        </div>
                    )}
                </AsyncState>
            )}

            {/* ── Pagination bar ────────────────────────────────── */}
            {status !== 'loading' && totalPages > 1 ? (
                <div className='ca-animate-up' style={{ borderRadius: '1.25rem', border: '1px solid rgba(207,216,230,0.75)', background: 'rgba(255,255,255,0.96)', boxShadow: '0 6px 20px -14px rgba(30,42,80,0.2)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                        {start}–{end} of {count} results
                    </p>
                    <Pagination page={page} totalPages={totalPages} onPrev={() => goToPage(page - 1)} onNext={() => goToPage(page + 1)} onGo={goToPage} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7b88a6', whiteSpace: 'nowrap' }}>Go to</span>
                        <input
                            type='number' min={1} max={totalPages} defaultValue={page} key={page}
                            onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(e.target.value, 10); if (v >= 1 && v <= totalPages) goToPage(v) } }}
                            className='ca-input'
                            style={{ width: '4rem', textAlign: 'center', height: '2.2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        />
                    </div>
                </div>
            ) : null}
            </div>
        </>
    )
}

export default HotelApplicationsListPage
