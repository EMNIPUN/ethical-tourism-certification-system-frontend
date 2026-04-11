import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectAuthUser } from '../../auth/store/authSelectors'
import { ArrowLeft, UserCircle, MapPin, Mail, Key, Shield, LogOut, CheckCircle2 } from 'lucide-react'

function ProfilePage() {
    const user = useSelector(selectAuthUser)

    const userName = user?.name || user?.email || 'My Account'
    const email = user?.email || 'admin@example.com'
    const role = user?.role || 'Hotel Owner'

    const initials = (user?.name || user?.email || 'M')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const avatar = user?.photo || user?.avatar || user?.profilePicture || user?.avatarUrl

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* ── Premium Hero Header ─────────────────────────────────────────── */}
            <header className='ca-animate-up' style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '3.5rem 3.5rem 6.5rem',
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}>
                {/* Background glowing effects */}
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(88,104,216,0.12) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Link to="/certificate-application" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, width: 'fit-content' }}>
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back to Dashboard
                    </Link>

                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            <Shield size={13} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            Account Settings
                        </div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, color: '#f8fafc' }}>
                            Your Profile
                        </h1>
                    </div>
                </div>
            </header>

            {/* Overlapping Profile Card */}
            <div className='ca-animate-up-1' style={{ marginTop: '-4rem', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 1)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    borderRadius: '1.5rem',
                    padding: '2rem 2.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8) inset',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Huge Avatar */}
                        {avatar ? (
                            <img src={avatar} alt={userName} style={{ width: '6rem', height: '6rem', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.2)', border: '4px solid #fff' }} />
                        ) : (
                            <div style={{ width: '6rem', height: '6rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,104,216,0.15) 0%, rgba(88,104,216,0.05) 100%)', border: '2px solid rgba(88,104,216,0.2)', color: '#5868d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, boxShadow: '0 10px 25px -5px rgba(15,23,42,0.1)' }}>
                                {initials}
                            </div>
                        )}
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{userName}</h2>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>{email}</p>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(88,104,216,0.1)', color: '#4a52c9', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.75rem' }}>
                                <CheckCircle2 size={12} strokeWidth={3} />
                                {role}
                            </span>
                        </div>
                    </div>

                    <button className='ca-btn-primary' style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 4px 15px -4px rgba(15,23,42,0.4)', color: '#fff', border: 'none', height: '2.8rem', padding: '0 1.5rem', borderRadius: '0.85rem' }}>
                        Edit Public Profile
                    </button>
                </div>
            </div>

            {/* Quick Settings Grid */}
            <div className='ca-animate-up-2' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>

                {/* Personal Details */}
                <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(226,232,240,0.6)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(88,104,216,0.1)', color: '#5868d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCircle size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Personal Details</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Manage your basic information.</p>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name</label>
                            <input type="text" defaultValue={userName} disabled style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', border: '1px solid rgba(207,216,230,0.8)', background: '#f8fafc', color: '#334155', fontWeight: 600 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</label>
                            <input type="email" defaultValue={email} disabled style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', border: '1px solid rgba(207,216,230,0.8)', background: '#f8fafc', color: '#334155', fontWeight: 600 }} />
                        </div>
                    </div>
                </div>

                {/* Security Setup */}
                <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(226,232,240,0.6)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(31,108,68,0.1)', color: '#1f6c44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Security & Login</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Update your password and login methods.</p>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Password</label>
                            <input type="password" value="********" disabled style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.6rem', border: '1px solid rgba(207,216,230,0.8)', background: '#f8fafc', color: '#334155', fontWeight: 600 }} />
                        </div>
                        <button className='ca-btn-secondary' style={{ height: '2.8rem', borderRadius: '0.6rem', width: 'fit-content' }}>
                            Change Password
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProfilePage
