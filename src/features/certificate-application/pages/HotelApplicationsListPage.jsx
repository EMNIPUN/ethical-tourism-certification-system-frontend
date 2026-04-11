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
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AsyncState from '../components/AsyncState'
import {
    selectHotelApplications,
    selectHotelApplicationsCount,
    selectHotelApplicationsError,
    selectHotelApplicationsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotels } from '../store/certificateApplicationSlice'

/* ── Constants ───────────────────────────────────────────────────── */
const PAGE_SIZE     = 10
const SORT_OPTIONS  = [
    { label: 'Newest first',    value: '-createdAt' },
    { label: 'Oldest first',    value: 'createdAt' },
    { label: 'Name (A–Z)',      value: 'businessInfo.name' },
    { label: 'Name (Z–A)',      value: '-businessInfo.name' },
    { label: 'Top Google score', value: '-scoring.googleReviewScore' },
]
const TYPE_OPTIONS  = ['Hotel', 'Resort', 'Lodge', 'Guesthouse']
const CERT_OPTIONS  = ['None', 'Bronze', 'Silver', 'Gold', 'Platinum']

/* ── Helpers ─────────────────────────────────────────────────────── */
function certBadgeClass(level) {
    switch ((level || '').toLowerCase()) {
        case 'bronze':   return 'ca-cert-badge ca-cert-badge--bronze'
        case 'silver':   return 'ca-cert-badge ca-cert-badge--silver'
        case 'gold':     return 'ca-cert-badge ca-cert-badge--gold'
        case 'platinum': return 'ca-cert-badge ca-cert-badge--platinum'
        default:         return 'ca-cert-badge ca-cert-badge--none'
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
    const thumbnail   = hotel?.googleMapsData?.thumbnail

    return (
        <Link
            to={`/certificate-application/${hotel?._id}`}
            className='ca-hotel-card ca-animate-up'
            style={{ animationDelay: `${index * 45}ms`, padding: 0, overflow: 'hidden' }}
        >
            {/* Cover image */}
            <div style={{
                height: '9rem',
                background: thumbnail
                    ? `url('${thumbnail}') center/cover no-repeat`
                    : 'linear-gradient(135deg, rgba(88,104,216,0.1) 0%, rgba(88,104,216,0.04) 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {!thumbnail && (
                    <Building2 size={32} strokeWidth={1.2} style={{ color: 'rgba(88,104,216,0.3)' }} />
                )}
                {/* Cert badge overlaid on image */}
                <span
                    className={certBadgeClass(certLevel)}
                    style={{
                        position: 'absolute',
                        top: '0.65rem',
                        right: '0.65rem',
                        backdropFilter: 'blur(6px)',
                        background: 'rgba(255,255,255,0.88)',
                    }}
                >
                    <Award size={11} />{certLevel}
                </span>
            </div>

            {/* Card body */}
            <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p className='ca-hotel-name' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {name}
                        </p>
                        <p className='ca-hotel-type'>{type}</p>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(207,216,230,0.55)', margin: '0.85rem 0' }} />

                <div className='ca-hotel-meta'>
                    {typeof googleScore === 'number' ? (
                        <span className='ca-meta-chip'><Star size={11} strokeWidth={2.5} />{googleScore.toFixed(1)} Google</span>
                    ) : null}
                    {typeof dataScore === 'number' ? (
                        <span className='ca-meta-chip'><TrendingUp size={11} strokeWidth={2.5} />{Math.round(dataScore)}% complete</span>
                    ) : null}
                    {hasMatch ? (
                        <span className='ca-meta-chip' style={{ color: '#1f6c44', borderColor: 'rgba(31,108,68,0.25)', background: 'rgba(31,108,68,0.07)' }}>
                            <Globe size={11} strokeWidth={2.5} />Match confirmed
                        </span>
                    ) : (
                        <span className='ca-meta-chip' style={{ color: '#92620a', borderColor: 'rgba(180,120,20,0.25)', background: 'rgba(180,120,20,0.07)' }}>
                            Match pending
                        </span>
                    )}
                    <span className='ca-hotel-cta'>
                        View <ArrowRight size={14} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </Link>
    )
}

/* ── Skeleton card ───────────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div style={{
            borderRadius: '1.4rem',
            border: '1px solid rgba(207,216,230,0.8)',
            background: 'rgba(255,255,255,0.96)',
            padding: '1.5rem',
            display: 'grid',
            gap: '0.75rem',
        }}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div className='ca-skeleton' style={{ width: '2.8rem', height: '2.8rem', borderRadius: '0.85rem' }} />
                <div style={{ flex: 1, display: 'grid', gap: '0.45rem' }}>
                    <div className='ca-skeleton' style={{ height: '0.9rem', width: '60%', borderRadius: '0.4rem' }} />
                    <div className='ca-skeleton' style={{ height: '0.7rem', width: '35%', borderRadius: '0.4rem' }} />
                </div>
                <div className='ca-skeleton' style={{ height: '1.5rem', width: '5rem', borderRadius: '999px' }} />
            </div>
            <div className='ca-skeleton' style={{ height: '1px', borderRadius: '999px' }} />
            <div style={{ display: 'flex', gap: '0.6rem' }}>
                {[55, 75, 70].map((w, i) => (
                    <div key={i} className='ca-skeleton' style={{ height: '1.6rem', width: `${w}px`, borderRadius: '0.6rem' }} />
                ))}
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
            <button
                style={{ ...btnBase, color: page === 1 ? '#c0c8d8' : '#4a5878', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                disabled={page === 1}
                onClick={onPrev}
            >
                <ChevronLeft size={15} strokeWidth={2.5} />
            </button>

            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`ellipsis-${i}`} style={{ fontSize: '0.82rem', color: '#8c98af', padding: '0 0.2rem' }}>…</span>
                ) : (
                    <button
                        key={p}
                        style={{
                            ...btnBase,
                            background: p === page ? 'linear-gradient(135deg,#6372ec,#4a52c9)' : 'rgba(255,255,255,0.95)',
                            color: p === page ? '#fff' : '#4a5878',
                            borderColor: p === page ? 'transparent' : 'rgba(207,216,230,0.8)',
                            boxShadow: p === page ? '0 4px 12px -6px rgba(74,82,201,0.5)' : 'none',
                        }}
                        onClick={() => onGo(p)}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                style={{ ...btnBase, color: page === totalPages ? '#c0c8d8' : '#4a5878', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                disabled={page === totalPages}
                onClick={onNext}
            >
                <ChevronRight size={15} strokeWidth={2.5} />
            </button>
        </div>
    )
}

/* ── Main page ───────────────────────────────────────────────────── */
function HotelApplicationsListPage() {
    const dispatch = useDispatch()
    const hotels   = useSelector(selectHotelApplications)
    const count    = useSelector(selectHotelApplicationsCount)
    const status   = useSelector(selectHotelApplicationsStatus)
    const error    = useSelector(selectHotelApplicationsError)

    /* Local state */
    const [page,       setPage]       = useState(1)
    const [sort,       setSort]       = useState('-createdAt')
    const [search,     setSearch]     = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [certFilter, setCertFilter] = useState('')
    const [showFilter, setShowFilter] = useState(false)

    const searchRef    = useRef(null)
    const debounceRef  = useRef(null)

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

    /* ── Loader ─────────────────────────────────────────────── */
    const load = useCallback((overrides = {}) => {
        const p     = overrides.page     ?? page
        const s     = overrides.sort     ?? sort
        const q     = overrides.search   ?? search
        const type  = overrides.type     ?? typeFilter
        const cert  = overrides.cert     ?? certFilter

        const filters = {}
        if (q)    filters.search                        = q
        if (type) filters['businessInfo.businessType']  = type
        if (cert) filters['scoring.certificationLevel'] = cert

        dispatch(fetchHotels({ page: p, limit: PAGE_SIZE, sort: s, filters }))
    }, [dispatch, page, sort, search, typeFilter, certFilter])

    useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Handlers ───────────────────────────────────────────── */
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
        load({ type: val, page: 1 })
    }

    function handleCertChange(val) {
        setCertFilter(val)
        setPage(1)
        load({ cert: val, page: 1 })
    }

    function clearAllFilters() {
        setSearch('')
        setTypeFilter('')
        setCertFilter('')
        setSort('-createdAt')
        setPage(1)
        load({ search: '', type: '', cert: '', sort: '-createdAt', page: 1 })
    }

    const hasActiveFilters = search || typeFilter || certFilter || sort !== '-createdAt'
    const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const end   = Math.min(page * PAGE_SIZE, count)

    return (
        <>
            {/* ── Hero ────────────────────────────────────────────── */}
            <header className='ca-hero ca-animate-up'>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <div>
                        <span className='ca-hero-eyebrow'>
                            <Award size={11} strokeWidth={3} />
                            Certificate Applications
                        </span>
                        <h1 className='ca-hero-title'>Hotel Applications</h1>
                        <p className='ca-hero-desc'>
                            Create applications, confirm Google profile matches, and track your certification progress.
                        </p>
                    </div>
                    <Link to='/certificate-application/new' className='ca-btn-primary'>
                        <Plus size={16} strokeWidth={2.5} />
                        New application
                    </Link>
                </div>
            </header>

            {/* ── Toolbar — search + filters + sort ───────────────── */}
            <div className='ca-animate-up-1' style={{ display: 'grid', gap: '0.75rem' }}>
                {/* Top row */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 220px', position: 'relative' }}>
                        <Search
                            size={15}
                            strokeWidth={2.5}
                            style={{
                                position: 'absolute', left: '0.9rem', top: '50%',
                                transform: 'translateY(-50%)', color: '#8c98af', pointerEvents: 'none',
                            }}
                        />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            placeholder='Search hotels…'
                            className='ca-input'
                            style={{ paddingLeft: '2.4rem', paddingRight: search ? '2.4rem' : '1rem' }}
                        />
                        {search ? (
                            <button
                                onClick={() => handleSearchChange('')}
                                style={{
                                    position: 'absolute', right: '0.7rem', top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: '#8c98af', display: 'flex', padding: 0,
                                }}
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        ) : null}
                    </div>

                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={e => handleSortChange(e.target.value)}
                        className='ca-select'
                        style={{ flex: '0 1 190px' }}
                    >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilter(v => !v)}
                        className={showFilter || (typeFilter || certFilter) ? 'ca-btn-primary' : 'ca-btn-secondary'}
                        style={{ height: '3rem', padding: '0 1rem', gap: '0.45rem' }}
                    >
                        <SlidersHorizontal size={14} strokeWidth={2.5} />
                        Filters
                        {(typeFilter || certFilter) ? (
                            <span style={{
                                background: 'rgba(255,255,255,0.3)',
                                borderRadius: '999px',
                                padding: '0.05rem 0.45rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                            }}>
                                {[typeFilter, certFilter].filter(Boolean).length}
                            </span>
                        ) : null}
                    </button>

                    {/* Clear all */}
                    {hasActiveFilters ? (
                        <button
                            onClick={clearAllFilters}
                            className='ca-btn-secondary'
                            style={{ height: '3rem', padding: '0 1rem', color: '#c0392b', borderColor: 'rgba(200,50,50,0.25)' }}
                        >
                            <X size={14} strokeWidth={2.5} />
                            Clear all
                        </button>
                    ) : null}
                </div>

                {/* Expanded filter panel */}
                {showFilter ? (
                    <div
                        className='ca-animate-scale'
                        style={{
                            borderRadius: '1.25rem',
                            border: '1.5px solid rgba(88,104,216,0.2)',
                            background: 'rgba(248,250,255,0.97)',
                            padding: '1.1rem 1.25rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            alignItems: 'flex-end',
                        }}
                    >
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

                {/* Results count bar */}
                {status !== 'loading' && count > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                            Showing <strong style={{ color: '#1a2345' }}>{start}–{end}</strong> of{' '}
                            <strong style={{ color: '#1a2345' }}>{count}</strong> application{count !== 1 ? 's' : ''}
                        </p>
                        {totalPages > 1 ? (
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                                Page <strong style={{ color: '#1a2345' }}>{page}</strong> of{' '}
                                <strong style={{ color: '#1a2345' }}>{totalPages}</strong>
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* ── Card grid ────────────────────────────────────────── */}
            {status === 'loading' ? (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : (
                <AsyncState
                    status={status}
                    error={error}
                    loadingMessage='Loading applications…'
                    onRetry={() => load()}
                    retryLabel='Reload'
                >
                    {hotels?.length ? (
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                            {hotels.map((hotel, i) => (
                                <HotelCard key={hotel._id} hotel={hotel} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className='ca-empty ca-animate-scale'>
                            <div className='ca-empty-icon'>
                                {hasActiveFilters ? <Search size={28} strokeWidth={1.5} /> : <Building2 size={28} strokeWidth={1.5} />}
                            </div>
                            <p className='ca-empty-title'>
                                {hasActiveFilters ? 'No results match your filters' : 'No applications yet'}
                            </p>
                            <p className='ca-empty-desc'>
                                {hasActiveFilters
                                    ? 'Try adjusting your search terms or clearing the active filters.'
                                    : 'Start by creating your first hotel application to begin the certification process.'}
                            </p>
                            {hasActiveFilters ? (
                                <button onClick={clearAllFilters} className='ca-btn-secondary' style={{ marginTop: '0.75rem' }}>
                                    <X size={14} strokeWidth={2.5} />
                                    Clear filters
                                </button>
                            ) : (
                                <Link to='/certificate-application/new' className='ca-btn-primary' style={{ marginTop: '0.75rem' }}>
                                    <Plus size={16} strokeWidth={2.5} />
                                    Create first application
                                </Link>
                            )}
                        </div>
                    )}
                </AsyncState>
            )}

            {/* ── Pagination ────────────────────────────────────────── */}
            {status !== 'loading' && totalPages > 1 ? (
                <div
                    className='ca-animate-up'
                    style={{
                        borderRadius: '1.25rem',
                        border: '1px solid rgba(207,216,230,0.75)',
                        background: 'rgba(255,255,255,0.96)',
                        boxShadow: '0 6px 20px -14px rgba(30,42,80,0.2)',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                    }}
                >
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#7b88a6' }}>
                        {start}–{end} of {count} results
                    </p>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPrev={() => goToPage(page - 1)}
                        onNext={() => goToPage(page + 1)}
                        onGo={goToPage}
                    />

                    {/* Page jump */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#7b88a6', whiteSpace: 'nowrap' }}>Go to</span>
                        <input
                            type='number'
                            min={1}
                            max={totalPages}
                            defaultValue={page}
                            key={page}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    const val = parseInt(e.target.value, 10)
                                    if (val >= 1 && val <= totalPages) goToPage(val)
                                }
                            }}
                            className='ca-input'
                            style={{ width: '4rem', textAlign: 'center', height: '2.2rem', fontSize: '0.82rem', padding: '0 0.5rem' }}
                        />
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default HotelApplicationsListPage
