import {
    Award,
    Calendar,
    ChevronRight,
    Clock,
    RefreshCw,
    Shield,
    ShieldCheck,
    Star,
    TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../../shared/api/apiClient'
import { getStoredToken } from '../../auth/services/authService'

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

/* ── Status / Level styling ─────────────────────────────────────── */
const STATUS_STYLES = {
    ACTIVE:   { bg: 'rgba(16,185,129,0.1)',  color: '#047857', border: 'rgba(16,185,129,0.25)', label: 'Active' },
    EXPIRED:  { bg: 'rgba(245,158,11,0.1)',   color: '#b45309', border: 'rgba(245,158,11,0.25)', label: 'Expired' },
    REVOKED:  { bg: 'rgba(239,68,68,0.1)',    color: '#b91c1c', border: 'rgba(239,68,68,0.25)',  label: 'Revoked' },
    INACTIVE: { bg: 'rgba(100,116,139,0.1)',  color: '#475569', border: 'rgba(100,116,139,0.25)',label: 'Inactive' },
}

const LEVEL_STYLES = {
    PLATINUM: { bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', color: '#0e7490', border: 'rgba(14,116,144,0.25)' },
    GOLD:     { bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: '#b45309', border: 'rgba(245,158,11,0.35)' },
    SILVER:   { bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#475569', border: 'rgba(100,116,139,0.3)' },
}

function getStatusStyle(status) {
    return STATUS_STYLES[String(status || '').toUpperCase()] || STATUS_STYLES.INACTIVE
}

function getLevelStyle(level) {
    return LEVEL_STYLES[String(level || '').toUpperCase()] || { bg: '#f8fafc', color: '#64748b', border: 'rgba(203,213,225,0.8)' }
}

/* ── Certificate card ───────────────────────────────────────────── */
function CertificateCard({ cert, index }) {
    const status    = String(cert.status || '').toUpperCase()
    const level     = String(cert.level || '').toUpperCase()
    const sSt       = getStatusStyle(status)
    const lSt       = getLevelStyle(level)
    const hotelName = cert.hotelId?.businessInfo?.name || 'Unknown Hotel'
    const daysLeft  = daysBetween(new Date(), cert.expiryDate)

    return (
        <div
            className='ca-animate-up'
            style={{
                animationDelay: `${index * 50}ms`,
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid rgba(226,232,240,0.8)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(88,104,216,0.15)'
                e.currentTarget.style.borderColor = 'rgba(88,104,216,0.3)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 20px -10px rgba(15,23,42,0.05)'
                e.currentTarget.style.borderColor = 'rgba(226,232,240,0.8)'
            }}
        >
            {/* Header strip */}
            <div style={{
                padding: '1.25rem 1.5rem',
                background: lSt.bg,
                borderBottom: `1px solid ${lSt.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: '2.4rem', height: '2.4rem', borderRadius: '0.75rem',
                        background: 'rgba(255,255,255,0.85)', border: `1px solid ${lSt.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <Award size={18} strokeWidth={2.5} style={{ color: lSt.color }} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: lSt.color, opacity: 0.8 }}>
                            {level || 'N/A'} Certificate
                        </p>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                            {cert.certificateNumber}
                        </p>
                    </div>
                </div>
                <span style={{
                    padding: '0.3rem 0.7rem', borderRadius: '999px',
                    background: sSt.bg, color: sSt.color, border: `1px solid ${sSt.border}`,
                    fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                    {sSt.label}
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {hotelName}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Star size={13} strokeWidth={2.5} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                            {cert.trustScore ?? '—'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Trust</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} strokeWidth={2.5} style={{ color: '#6366f1' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            {formatDate(cert.issuedDate)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} strokeWidth={2.5} style={{ color: status === 'ACTIVE' && daysLeft !== null && daysLeft <= 45 ? '#f59e0b' : '#94a3b8' }} />
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 600,
                            color: status === 'ACTIVE' && daysLeft !== null && daysLeft <= 45 ? '#b45309' : '#475569',
                        }}>
                            {daysLeft !== null ? (daysLeft >= 0 ? `${daysLeft}d left` : `${Math.abs(daysLeft)}d overdue`) : '—'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RefreshCw size={13} strokeWidth={2.5} style={{ color: '#94a3b8' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                            {cert.renewalCount ?? 0} renewal{(cert.renewalCount ?? 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(226,232,240,0.5) 0%, rgba(226,232,240,1) 50%, rgba(226,232,240,0.5) 100%)', margin: '0 0 1rem 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        Expires {formatDate(cert.expiryDate)}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        color: '#5868d8', fontSize: '0.82rem', fontWeight: 700,
                    }}>
                        Details <ChevronRight size={14} strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </div>
    )
}

/* ── Skeleton card ──────────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', overflow: 'hidden' }}>
            <div className='ca-skeleton' style={{ height: '5rem', borderRadius: 0 }} />
            <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gap: '0.65rem' }}>
                <div className='ca-skeleton' style={{ height: '1.1rem', width: '65%', borderRadius: '0.4rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className='ca-skeleton' style={{ height: '0.9rem', borderRadius: '0.4rem' }} />
                    <div className='ca-skeleton' style={{ height: '0.9rem', borderRadius: '0.4rem' }} />
                    <div className='ca-skeleton' style={{ height: '0.9rem', borderRadius: '0.4rem' }} />
                    <div className='ca-skeleton' style={{ height: '0.9rem', borderRadius: '0.4rem' }} />
                </div>
                <div className='ca-skeleton' style={{ height: '1px', borderRadius: '999px', margin: '0.3rem 0' }} />
                <div className='ca-skeleton' style={{ height: '0.9rem', width: '40%', borderRadius: '0.4rem' }} />
            </div>
        </div>
    )
}

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtitle }) {
    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid rgba(226,232,240,0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 16px 35px -12px rgba(15,23,42,0.12)'
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 4px 20px -10px rgba(15,23,42,0.05)'
        }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '2.8rem', height: '2.8rem', borderRadius: '0.85rem',
                    background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} strokeWidth={2.5} style={{ color: iconColor }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                    {label}
                </p>
            </div>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {value}
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                {subtitle}
            </p>
        </div>
    )
}

/* ── Main page ──────────────────────────────────────────────────── */
function OwnerCertificatesPage() {
    const [certificates, setCertificates] = useState([])
    const [status, setStatus]   = useState('idle') // idle | loading | succeeded | failed
    const [error, setError]     = useState(null)

    const fetchOwnerCertificates = useCallback(async () => {
        setStatus('loading')
        setError(null)
        try {
            const token = getStoredToken()
            if (!token) throw new Error('Authentication required')
            const data = await apiRequest('/certification/certificates', { method: 'GET', token })
            setCertificates(Array.isArray(data?.data) ? data.data : [])
            setStatus('succeeded')
        } catch (err) {
            setError(err?.message || 'Failed to load certificates')
            setStatus('failed')
        }
    }, [])

    useEffect(() => { fetchOwnerCertificates() }, [fetchOwnerCertificates])

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
                padding: '3.5rem 4rem',
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                marginBottom: '2.5rem',
            }}>
                {/* Background glowing effects */}
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(88,104,216,0.15) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />

                {/* Abstract grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2.5rem' }}>
                    <div style={{ maxWidth: '650px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            <Shield size={13} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            My Certificates
                        </div>
                        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 1.25rem 0', color: '#f8fafc' }}>
                            Certification Status
                        </h1>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#94a3b8', margin: 0, fontWeight: 400 }}>
                            Track your issued ethical tourism certificates, monitor trust scores, and stay ahead of upcoming renewals.
                        </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                        <Link to='/certificate-application/new'
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '1.1rem 1.85rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(88,104,216,0.5)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid rgba(255,255,255,0.15)' }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 18px 35px -8px rgba(88,104,216,0.7)' }}
                              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(88,104,216,0.5)' }}
                        >
                            <Award size={18} strokeWidth={2.5} />
                            New Application
                        </Link>
                    </div>
                </div>
            </header>

            <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* ── Stat cards ──────────────────────────────────── */}
                <div className='ca-animate-up-1' style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
                    <StatCard
                        icon={Award}
                        iconBg='rgba(99,102,241,0.1)'
                        iconColor='#6366f1'
                        label='Total Certificates'
                        value={metrics.total}
                        subtitle={`${metrics.active} currently active`}
                    />
                    <StatCard
                        icon={ShieldCheck}
                        iconBg='rgba(16,185,129,0.1)'
                        iconColor='#10b981'
                        label='Active'
                        value={metrics.active}
                        subtitle={metrics.total ? `${Math.round((metrics.active / metrics.total) * 100)}% of all certificates` : 'No certificates yet'}
                    />
                    <StatCard
                        icon={TrendingUp}
                        iconBg='rgba(245,158,11,0.1)'
                        iconColor='#f59e0b'
                        label='Avg Trust Score'
                        value={metrics.avgTrust}
                        subtitle='Across active certificates'
                    />
                    <StatCard
                        icon={Clock}
                        iconBg={metrics.expiringSoon > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)'}
                        iconColor={metrics.expiringSoon > 0 ? '#ef4444' : '#64748b'}
                        label='Expiring Soon'
                        value={metrics.expiringSoon}
                        subtitle={metrics.expiringSoon > 0 ? 'Within next 45 days' : 'No immediate pressure'}
                    />
                </div>

                {/* ── Certificate grid ──────────────────────────── */}
                {status === 'loading' ? (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : status === 'failed' ? (
                    <div className='ca-animate-up-2' style={{ padding: '3rem 2rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)' }}>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#b91c1c' }}>{error}</p>
                        <button
                            onClick={fetchOwnerCertificates}
                            className='ca-btn-primary'
                            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '2.8rem', padding: '0 1.25rem', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontWeight: 700, boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)', border: 'none', cursor: 'pointer' }}
                        >
                            <RefreshCw size={16} strokeWidth={2.5} /> Retry
                        </button>
                    </div>
                ) : certificates.length ? (
                    <div className='ca-animate-up-2' style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
                        {certificates.map((cert, i) => (
                            <CertificateCard key={cert._id || cert.certificateNumber} cert={cert} index={i} />
                        ))}
                    </div>
                ) : (
                    <div className='ca-animate-scale' style={{ padding: '4rem 2rem', background: '#ffffff', borderRadius: '1.5rem', border: '1px dashed rgba(203,213,225,0.8)', textAlign: 'center', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)' }}>
                        <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,104,216,0.1) 0%, rgba(88,104,216,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#5868d8' }}>
                            <Award size={32} strokeWidth={2} />
                        </div>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                            No certificates yet
                        </h2>
                        <p style={{ margin: '0 auto 1.5rem auto', fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', lineHeight: 1.6 }}>
                            Your certificates will appear here once they have been issued. Start by submitting a hotel application and completing the verification process.
                        </p>
                        <Link to='/certificate-application/new' className='ca-btn-primary' style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', height: '2.8rem', padding: '0 1.25rem', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', color: '#fff', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)' }}>
                            <Award size={16} strokeWidth={2.5} /> Create Application
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

export default OwnerCertificatesPage
