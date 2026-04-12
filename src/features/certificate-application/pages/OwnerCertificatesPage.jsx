import {
    Award,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    RefreshCw,
    Shield,
    ShieldCheck,
    Star,
    TrendingUp,
    XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../shared/api/apiClient'
import { getStoredToken } from '../../auth/services/authService'
import { useDispatch, useSelector } from 'react-redux'
import {
    selectOwnerCertificatesItems,
    selectOwnerCertificatesStatus,
    selectOwnerCertificatesError,
    selectOwnerPendingReviewItems,
    selectOwnerPendingReviewStatus,
    selectOwnerPendingReviewError,
} from '../store/certificateApplicationSelectors'
import { fetchOwnerCertificates, fetchOwnerPendingReviewHotels } from '../store/certificateApplicationSlice'

/* ── Helpers ────────────────────────────────────────────────────── */
function toDate(value) {
    if (!value) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysBetween(from, to) {
    const a = toDate(from)
    const b = toDate(to)
    if (!a || !b) return null
    return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(value) {
    const d = toDate(value)
    if (!d) return '—'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateFull(value) {
    const d = toDate(value)
    if (!d) return '—'
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

/* ── Badge components ───────────────────────────────────────────── */
const STATUS_META = {
    ACTIVE: { bg: 'rgba(16,185,129,0.12)', color: '#047857', border: 'rgba(16,185,129,0.3)', label: 'Active', dot: '#10b981' },
    EXPIRED: { bg: 'rgba(245,158,11,0.12)', color: '#b45309', border: 'rgba(245,158,11,0.3)', label: 'Expired', dot: '#f59e0b' },
    REVOKED: { bg: 'rgba(239,68,68,0.12)', color: '#b91c1c', border: 'rgba(239,68,68,0.3)', label: 'Revoked', dot: '#ef4444' },
    INACTIVE: { bg: 'rgba(100,116,139,0.12)', color: '#475569', border: 'rgba(100,116,139,0.3)', label: 'Inactive', dot: '#94a3b8' },
}

const LEVEL_COLORS = {
    PLATINUM: { primary: '#0e7490', secondary: '#06b6d4', bg: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #06b6d4 100%)' },
    GOLD: { primary: '#b45309', secondary: '#f59e0b', bg: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #f59e0b 100%)' },
    SILVER: { primary: '#475569', secondary: '#94a3b8', bg: 'linear-gradient(135deg, #334155 0%, #475569 50%, #94a3b8 100%)' },
}

function getStatus(s) { return STATUS_META[String(s || '').toUpperCase()] || STATUS_META.INACTIVE }
function getLevel(l) { return LEVEL_COLORS[String(l || '').toUpperCase()] || LEVEL_COLORS.SILVER }

/* ── Trust Score Gauge ──────────────────────────────────────────── */
function TrustGauge({ score, size = 90 }) {
    const r = (size - 12) / 2
    const c = 2 * Math.PI * r
    const pct = Math.min(100, Math.max(0, score))
    const offset = c - (pct / 100) * c
    const gaugeColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth="6" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={gaugeColor} strokeWidth="6"
                strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
                style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: '1.3rem', fontWeight: 800, fill: '#0f172a' }}>
                {score}
            </text>
        </svg>
    )
}

/* ── Expiry Progress Bar ────────────────────────────────────────── */
function ExpiryBar({ issuedDate, expiryDate }) {
    const issued = toDate(issuedDate)
    const expiry = toDate(expiryDate)
    const now = new Date()
    if (!issued || !expiry) return null

    const total = expiry.getTime() - issued.getTime()
    const elapsed = now.getTime() - issued.getTime()
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100))
    const daysLeft = daysBetween(now, expiry)
    const barColor = daysLeft !== null && daysLeft <= 45 ? '#f59e0b' : daysLeft !== null && daysLeft <= 0 ? '#ef4444' : '#10b981'

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8' }}>Validity period</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: daysLeft <= 45 ? '#b45309' : '#475569' }}>
                    {daysLeft !== null ? (daysLeft >= 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`) : '—'}
                </span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(226,232,240,0.6)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '999px', background: barColor, width: `${pct}%`, transition: 'width 1s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{formatDate(issuedDate)}</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{formatDate(expiryDate)}</span>
            </div>
        </div>
    )
}

/* ── Copy to clipboard helper ───────────────────────────────────── */
function useCopyToClipboard() {
    const [copied, setCopied] = useState(false)
    const timerRef = useRef(null)

    const copy = useCallback((text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => setCopied(false), 2000)
        }).catch(() => { })
    }, [])

    return { copied, copy }
}

/* ── Action Button ──────────────────────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = 'default', disabled = false }) {
    const styles = {
        default: { bg: '#fff', color: '#475569', border: 'rgba(226,232,240,0.9)', hoverBg: '#f8fafc' },
        primary: { bg: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', border: 'rgba(88,104,216,0.4)', hoverBg: 'linear-gradient(135deg, #4a52c9 0%, #3f44b5 100%)' },
        success: { bg: 'rgba(16,185,129,0.08)', color: '#047857', border: 'rgba(16,185,129,0.25)', hoverBg: 'rgba(16,185,129,0.15)' },
    }
    const s = styles[variant] || styles.default

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.55rem 0.9rem', borderRadius: '0.65rem',
                background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
                if (disabled) return
                e.currentTarget.style.background = s.hoverBg
                e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
                if (disabled) return
                e.currentTarget.style.background = s.bg
                e.currentTarget.style.transform = 'none'
            }}
        >
            <Icon size={14} strokeWidth={2.5} />{label}
        </button>
    )
}

/* ── Featured Certificate (expanded view) ───────────────────────── */
function FeaturedCertificate({ cert, onCopy, copied, onViewPdf, isViewingPdf }) {
    const status = String(cert.status || '').toUpperCase()
    const level = String(cert.level || '').toUpperCase()
    const sSt = getStatus(status)
    const lSt = getLevel(level)
    const hotelName = cert.hotelId?.businessInfo?.name || 'Unknown Hotel'
    const trustScore = cert.trustScore ?? 0
    const thumbnail = cert.hotelId?.googleMapsData?.thumbnail || null

    return (
        <div className='ca-animate-up-1' style={{
            background: '#ffffff',
            borderRadius: '1.5rem',
            border: '1px solid rgba(226,232,240,0.8)',
            overflow: 'hidden',
            boxShadow: '0 8px 30px -12px rgba(15,23,42,0.1)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header band with optional thumbnail background */}
            <div style={{
                padding: '2rem 2.5rem',
                background: thumbnail
                    ? `url('${thumbnail}') center/cover no-repeat`
                    : lSt.bg,
                position: 'relative',
                overflow: 'hidden',
                minHeight: thumbnail ? '12rem' : 'auto',
                display: 'flex',
                alignItems: 'flex-end',
            }}>
                {/* Dark gradient mask for readability */}
                {thumbnail && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.65) 50%, rgba(15,23,42,0.92) 100%)',
                        pointerEvents: 'none',
                    }} />
                )}
                {/* Subtle grid pattern */}
                <div style={{ position: 'absolute', inset: 0, opacity: thumbnail ? 0.04 : 0.08, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', width: '100%' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.85rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)' }}>
                                <Award size={22} strokeWidth={2.5} style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>{level} Certification</p>
                                <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textShadow: thumbnail ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>{cert.certificateNumber}</p>
                            </div>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', textShadow: thumbnail ? '0 2px 8px rgba(0,0,0,0.4)' : 'none' }}>{hotelName}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            padding: '0.4rem 1rem', borderRadius: '999px',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: '#fff', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sSt.dot, boxShadow: `0 0 6px ${sSt.dot}` }} />
                            {sSt.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '2rem 2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
                    {/* Trust gauge */}
                    <div style={{ textAlign: 'center' }}>
                        <TrustGauge score={trustScore} size={100} />
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trust Score</p>
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Issued</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{formatDate(cert.issuedDate)}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expires</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{formatDate(cert.expiryDate)}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Renewals</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{cert.renewalCount ?? 0}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Level</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', fontWeight: 800, color: lSt.primary }}>{level || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Expiry progress */}
                <ExpiryBar issuedDate={cert.issuedDate} expiryDate={cert.expiryDate} />

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(226,232,240,0.6)' }}>
                    <ActionBtn
                        icon={Eye}
                        label={isViewingPdf ? 'Opening…' : 'View PDF'}
                        onClick={() => onViewPdf(cert)}
                        variant="primary"
                        disabled={isViewingPdf}
                    />
                    <ActionBtn icon={copied ? CheckCircle2 : Copy} label={copied ? "Copied!" : "Copy ID"} onClick={() => onCopy(cert.certificateNumber)} variant={copied ? "success" : "default"} />
                    <ActionBtn icon={ExternalLink} label="Share" onClick={() => onCopy(`${window.location.origin}/verify/${cert.certificateNumber}`)} />
                    <ActionBtn icon={Eye} label="View Application" onClick={() => { if (cert.hotelId?._id) window.location.href = `/certificate-application/${cert.hotelId._id}` }} />
                </div>
            </div>
        </div>
    )
}

/* ── Table row for non-featured certificates ────────────────────── */
function CertificateRow({ cert, index, isSelected, onSelect, onCopy }) {
    const status = String(cert.status || '').toUpperCase()
    const level = String(cert.level || '').toUpperCase()
    const sSt = getStatus(status)
    const lSt = getLevel(level)
    const hotelName = cert.hotelId?.businessInfo?.name || 'Unknown Hotel'
    const daysLeft = daysBetween(new Date(), cert.expiryDate)

    return (
        <tr
            onClick={() => onSelect(cert)}
            style={{
                cursor: 'pointer',
                background: isSelected ? 'rgba(88,104,216,0.06)' : index % 2 === 0 ? '#fff' : 'rgba(248,250,252,0.5)',
                transition: 'all 0.15s ease',
                borderLeft: isSelected ? '3px solid #5868d8' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(88,104,216,0.03)' }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(88,104,216,0.06)' : index % 2 === 0 ? '#fff' : 'rgba(248,250,252,0.5)' }}
        >
            <td style={{ padding: '0.75rem 0.85rem' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{hotelName}</p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>{cert.certificateNumber}</p>
            </td>
            <td style={{ padding: '0.75rem 0.85rem' }}>
                <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: '999px',
                    background: sSt.bg, color: sSt.color, border: `1px solid ${sSt.border}`,
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sSt.dot }} />
                    {sSt.label}
                </span>
            </td>
            <td style={{ padding: '0.75rem 0.85rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: lSt.primary }}>{level || 'N/A'}</span>
            </td>
            <td style={{ padding: '0.75rem 0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{cert.trustScore ?? '—'}</span>
            </td>
            <td style={{ padding: '0.75rem 0.85rem' }}>
                <span style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    color: status === 'ACTIVE' && daysLeft !== null && daysLeft <= 45 ? '#b45309' : daysLeft !== null && daysLeft < 0 ? '#b91c1c' : '#475569',
                }}>
                    {daysLeft !== null ? (daysLeft >= 0 ? `${daysLeft}d` : `−${Math.abs(daysLeft)}d`) : '—'}
                </span>
            </td>
        </tr>
    )
}

/* ── Skeleton rows ──────────────────────────────────────────────── */
function SkeletonRows() {
    return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
            {Array.from({ length: 5 }).map((_, j) => (
                <td key={j} style={{ padding: '0.75rem 0.85rem' }}>
                    <div className='ca-skeleton' style={{ height: '0.85rem', width: j === 0 ? '80%' : j === 1 ? '55%' : '45%', borderRadius: '0.3rem' }} />
                    {j === 0 && <div className='ca-skeleton' style={{ height: '0.6rem', width: '60%', borderRadius: '0.3rem', marginTop: '0.3rem' }} />}
                </td>
            ))}
        </tr>
    ))
}

/* ── Pending review list (AI passed, audit pending) ────────────── */
function PendingReviewSection({ items, status, error }) {
    if (status === 'idle') return null

    const [collapsed, setCollapsed] = useState(true)

    return (
        <section className='ca-animate-up-1' style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)',
            overflow: 'hidden',
            marginBottom: '1.25rem',
        }}>
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid rgba(226,232,240,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.55rem', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={14} strokeWidth={2.5} style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Pending Review</h3>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Hotels that passed AI review and are awaiting audit or issuance</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(245,158,11,0.10)', color: '#b45309', fontSize: '0.7rem', fontWeight: 800 }}>
                        {status === 'loading' ? 'Loading…' : `${items.length} hotel${items.length !== 1 ? 's' : ''}`}
                    </span>
                    <button
                        type='button'
                        onClick={() => setCollapsed((v) => !v)}
                        aria-expanded={!collapsed}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '0.65rem',
                            border: '1px solid rgba(226,232,240,0.9)',
                            background: '#fff',
                            color: '#475569',
                            cursor: 'pointer',
                        }}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? (
                            <ChevronRight size={16} strokeWidth={2.7} />
                        ) : (
                            <ChevronDown size={16} strokeWidth={2.7} />
                        )}
                    </button>
                </div>
            </div>

            {!collapsed ? (
                status === 'failed' ? (
                    <div style={{ padding: '1rem 1.25rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem' }}>
                        {error || 'Failed to load pending review hotels'}
                    </div>
                ) : (
                    <div style={{ padding: '0.85rem 1.25rem' }}>
                        {status === 'loading' ? (
                            <div className='ca-skeleton' style={{ height: '2.4rem', width: '100%', borderRadius: '0.75rem' }} />
                        ) : items.length === 0 ? (
                            <p style={{ margin: 0, color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                                No pending review hotels right now.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.6rem' }}>
                                {items.map((row) => {
                                    const hotel = row?.hotel
                                    const name = hotel?.businessInfo?.name || 'Untitled Property'
                                    const type = hotel?.businessInfo?.businessType || 'Hotel'
                                    const id = row?.hotelId || hotel?._id || row?.hotelRequestId
                                    const auditStatus = String(row?.auditScore?.status || 'pending')
                                    const stage = String(row?.stage || '')

                                    return (
                                        <div key={String(id)} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '1rem',
                                            padding: '0.85rem 0.95rem',
                                            borderRadius: '0.9rem',
                                            border: '1px solid rgba(226,232,240,0.8)',
                                            background: 'linear-gradient(135deg, rgba(255,251,235,0.65) 0%, rgba(255,255,255,1) 70%)',
                                        }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
                                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                                    {type} • AI: Passed • Audit: {auditStatus}{stage === 'PENDING_CERTIFICATE' ? ' • Pending certificate' : ''}
                                                </p>
                                            </div>
                                            <Link to={`/certificate-application/${encodeURIComponent(hotel?._id || row?.hotelId)}`} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.55rem 0.85rem',
                                                borderRadius: '0.7rem',
                                                background: '#fff',
                                                border: '1px solid rgba(226,232,240,0.9)',
                                                textDecoration: 'none',
                                                fontSize: '0.78rem',
                                                fontWeight: 800,
                                                color: '#475569',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                <Eye size={14} strokeWidth={2.5} /> View
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            ) : null}
        </section>
    )
}

/* ── Main page ──────────────────────────────────────────────────── */
function OwnerCertificatesPage() {
    const dispatch = useDispatch()
    const certificates = useSelector(selectOwnerCertificatesItems)
    const status = useSelector(selectOwnerCertificatesStatus)
    const error = useSelector(selectOwnerCertificatesError)

    const pendingReviewItems = useSelector(selectOwnerPendingReviewItems)
    const pendingReviewStatus = useSelector(selectOwnerPendingReviewStatus)
    const pendingReviewError = useSelector(selectOwnerPendingReviewError)

    const [selected, setSelected] = useState(null)
    const { copied, copy } = useCopyToClipboard()
    const [viewingPdfFor, setViewingPdfFor] = useState(null)

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchOwnerCertificates())
        }
    }, [status, dispatch])

    useEffect(() => {
        if (pendingReviewStatus === 'idle') {
            dispatch(fetchOwnerPendingReviewHotels())
        }
    }, [pendingReviewStatus, dispatch])

    const handleRetry = useCallback(() => {
        dispatch(fetchOwnerCertificates())
        dispatch(fetchOwnerPendingReviewHotels())
    }, [dispatch])

    const handleViewPdf = useCallback(async (cert) => {
        const certificateNumber = cert?.certificateNumber
        if (!certificateNumber) return

        const token = getStoredToken()
        if (!token) {
            alert('Please log in again to view this certificate.')
            return
        }

        setViewingPdfFor(certificateNumber)
        try {
            const response = await apiRequest(
                `/certification/certificates/owner/${encodeURIComponent(certificateNumber)}/download-link`,
                { method: 'GET', token },
            )

            const url = response?.data?.url
            if (!url) {
                throw new Error('Certificate download link is not available')
            }

            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (e) {
            alert(e?.message || 'Failed to open certificate PDF')
        } finally {
            setViewingPdfFor(null)
        }
    }, [])

    // Auto-select the first active cert when certificates load and we haven't selected one
    useEffect(() => {
        if (certificates.length > 0 && !selected) {
            const firstActive = certificates.find(c => c.status === 'ACTIVE')
            setSelected(firstActive || certificates[0] || null)
        }
    }, [certificates, selected])

    /* ── Derived metrics ───────── */
    const metrics = useMemo(() => {
        const active = certificates.filter(c => c.status === 'ACTIVE')
        const expiringSoon = active.filter(c => {
            const d = daysBetween(new Date(), c.expiryDate)
            return d !== null && d >= 0 && d <= 45
        })
        const trustScores = active.map(c => Number(c.trustScore)).filter(Number.isFinite)
        const avgTrust = trustScores.length
            ? Math.round(trustScores.reduce((s, v) => s + v, 0) / trustScores.length)
            : 0

        return {
            total: certificates.length,
            active: active.length,
            expiringSoon: expiringSoon.length,
            avgTrust,
        }
    }, [certificates])

    return (
        <>
            {/* ── Hero ──────────────────────────────────────────── */}
            <header className='ca-animate-up' style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '3rem 3.5rem',
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                marginBottom: '2rem',
            }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(88,104,216,0.1) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                                <Shield size={12} strokeWidth={2.5} style={{ color: '#34d399' }} />
                                Certification Dashboard
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>
                                My Certificates
                            </h1>
                            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#94a3b8', margin: 0 }}>
                                View, download, and share your ethical tourism certificates. Track trust scores and renewal dates.
                            </p>
                        </div>
                        <Link to='/certificate-application/new'
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', borderRadius: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 20px -5px rgba(16,185,129,0.5)', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.15)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 28px -6px rgba(16,185,129,0.6)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -5px rgba(16,185,129,0.5)' }}
                        >
                            <Award size={16} strokeWidth={2.5} /> New Application
                        </Link>
                    </div>

                    {/* Inline stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        {[
                            { label: 'Total', value: metrics.total, icon: Award, color: '#818cf8' },
                            { label: 'Active', value: metrics.active, icon: ShieldCheck, color: '#34d399' },
                            { label: 'Avg Trust', value: metrics.avgTrust, icon: TrendingUp, color: '#fbbf24' },
                            { label: 'Expiring', value: metrics.expiringSoon, icon: Clock, color: metrics.expiringSoon > 0 ? '#f87171' : '#94a3b8' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                padding: '1rem 1.25rem', borderRadius: '1rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(8px)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                                    <stat.icon size={14} strokeWidth={2.5} style={{ color: stat.color }} />
                                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div style={{ width: '100%', margin: '0 auto' }}>
                <PendingReviewSection
                    items={pendingReviewItems}
                    status={pendingReviewStatus}
                    error={pendingReviewError}
                />

                {/* ── Error state ────────── */}
                {status === 'failed' && (
                    <div className='ca-animate-up-1' style={{ padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '1.25rem', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', marginBottom: '1.5rem' }}>
                        <XCircle size={40} strokeWidth={1.5} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                        <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#b91c1c' }}>{error}</p>
                        <button onClick={handleRetry} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px -4px rgba(88,104,216,0.4)' }}>
                            <RefreshCw size={15} strokeWidth={2.5} /> Retry
                        </button>
                    </div>
                )}

                {/* ── Master-Detail Side-by-Side Layout ── */}
                {status !== 'failed' && (
                    <div className='ca-animate-up-1' style={{
                        display: 'grid',
                        gridTemplateColumns: certificates.length > 0 && selected ? '1fr 1fr' : '1fr',
                        gap: '1.25rem',
                        alignItems: 'stretch',
                    }}>
                        {/* LEFT: Certificate List Table */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '1.25rem',
                            border: '1px solid rgba(226,232,240,0.8)',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)',
                        }}>
                            {/* Table header */}
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid rgba(226,232,240,0.6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.55rem', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Star size={14} strokeWidth={2.5} style={{ color: '#6366f1' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>All Certificates</h3>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>Select a row to view details</p>
                                    </div>
                                </div>
                                <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontSize: '0.7rem', fontWeight: 700 }}>
                                    {certificates.length} cert{certificates.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                        <tr style={{ background: 'rgba(248,250,252,0.95)', borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
                                            {['Property', 'Status', 'Level', 'Trust', 'Days Left'].map(h => (
                                                <th key={h} style={{ padding: '0.6rem 0.85rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {status === 'loading' ? (
                                            <SkeletonRows />
                                        ) : certificates.length > 0 ? (
                                            certificates.map((cert, i) => (
                                                <CertificateRow
                                                    key={cert._id || cert.certificateNumber}
                                                    cert={cert}
                                                    index={i}
                                                    isSelected={selected?._id === cert._id}
                                                    onSelect={setSelected}
                                                    onCopy={copy}
                                                />
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,104,216,0.1) 0%, rgba(88,104,216,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#5868d8' }}>
                                                        <Award size={24} strokeWidth={2} />
                                                    </div>
                                                    <p style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>No certificates yet</p>
                                                    <Link to='/certificate-application/new' style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', borderRadius: '0.7rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', boxShadow: '0 4px 12px -4px rgba(88,104,216,0.4)' }}>
                                                        <Award size={14} strokeWidth={2.5} /> Create Application
                                                    </Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* RIGHT: Detail Panel */}
                        {status === 'succeeded' && selected && (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <FeaturedCertificate
                                    cert={selected}
                                    onCopy={copy}
                                    copied={copied}
                                    onViewPdf={handleViewPdf}
                                    isViewingPdf={viewingPdfFor === selected?.certificateNumber}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default OwnerCertificatesPage
