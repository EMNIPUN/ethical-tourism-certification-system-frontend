import { Award, FileText, LayoutDashboard, LogOut, User, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink, Outlet } from 'react-router-dom'
import LogoutButton from '../../auth/components/LogoutButton'
import { selectAuthUser } from '../../auth/store/authSelectors'
import '../styles/certificate-application.css'

function NavPill({ to, label, icon: Icon, end = false }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                'ca-nav-pill' + (isActive ? ' active' : '')
            }
        >
            {Icon ? <Icon size={14} strokeWidth={2.5} /> : null}
            {label}
        </NavLink>
    )
}

function CertificateApplicationLayout() {
    const [menuOpen, setMenuOpen] = useState(false)
    const user = useSelector(selectAuthUser)
    
    const userName = user?.name || user?.email || 'My Account'
    const initials = (user?.name || user?.email || 'M')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    
    // Check common fields where profile images are stored
    const avatar = user?.photo || user?.avatar || user?.profilePicture || user?.avatarUrl

    return (
        <div className='ca-shell'>
            <header className='ca-topnav'>
                <div className='ca-topnav-inner'>
                    {/* Logo */}
                    <div className='inline-flex items-center gap-2' style={{ flexShrink: 0 }}>
                        <div>
                            <p className='text-[30px] font-semibold leading-none tracking-tight text-[#333]'>Certiguard</p>
                        </div>
                    </div>

                    {/* Nav pills */}
                    <nav className='ca-nav-pill-group'>
                        <NavPill to='/certificate-application' label='Applications' icon={LayoutDashboard} end />
                        <NavPill to='/certificate-application/new' label='New Application' icon={FileText} />
                        <NavPill to='/certificate-application/certificates' label='Certificates' icon={Award} />
                    </nav>

                    {/* Profile Dropdown */}
                    <div 
                        style={{ position: 'relative' }} 
                        onMouseEnter={() => setMenuOpen(true)} 
                        onMouseLeave={() => setMenuOpen(false)}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                            padding: '0.4rem 0.6rem', paddingRight: '1rem',
                            borderRadius: '999px', border: '1px solid rgba(207,216,230,0.8)',
                            background: '#fff', fontSize: '0.85rem', fontWeight: 600, color: '#1a2345',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(30,42,80,0.04)'
                        }}>
                            {avatar ? (
                                <img src={avatar} alt={userName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(88,104,216,0.15) 0%, rgba(88,104,216,0.05) 100%)', border: '1px solid rgba(88,104,216,0.2)', color: '#5868d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                                    {initials}
                                </div>
                            )}
                            <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                        </div>
                        
                        {/* Dropdown Container (includes padding invisible area for hover continuity) */}
                        <div style={{
                            position: 'absolute', top: '100%', right: 0,
                            paddingTop: '0.5rem', zIndex: 50,
                            pointerEvents: menuOpen ? 'auto' : 'none',
                            opacity: menuOpen ? 1 : 0,
                            transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <div style={{
                                background: '#fff', borderRadius: '0.85rem', padding: '0.5rem',
                                boxShadow: '0 10px 30px -10px rgba(15,23,42,0.15)',
                                border: '1px solid rgba(226,232,240,0.8)',
                                minWidth: '170px',
                            }}>
                                <div style={{ padding: '0.5rem 0.8rem 0.75rem', marginBottom: '0.25rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signed in as</p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</p>
                                </div>
                                <div style={{ height: '1px', background: 'rgba(226,232,240,0.8)', margin: '0 0 0.25rem' }} />

                                <NavLink to="/certificate-application/profile" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.6rem 0.8rem', borderRadius: '0.5rem',
                                    fontSize: '0.85rem', fontWeight: 600, color: '#475569',
                                    textDecoration: 'none', transition: 'all 0.2s'
                                }} onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}>
                                    <User size={15} strokeWidth={2.5} /> Profile
                                </NavLink>
                                
                                <div style={{ height: '1px', background: 'rgba(226,232,240,0.8)', margin: '0.25rem 0' }} />
                                
                                <LogoutButton style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                    justifyContent: 'flex-start', padding: '0.5rem 0.6rem', borderRadius: '0.6rem', 
                                    fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', 
                                    background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                }} onMouseEnter={e => { 
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'; 
                                    e.currentTarget.style.color = '#b91c1c';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }} onMouseLeave={e => { 
                                    e.currentTarget.style.background = 'transparent'; 
                                    e.currentTarget.style.color = '#ef4444';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}>
                                    <div style={{ padding: '0.35rem', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '0.4rem', display: 'flex', color: 'inherit', transition: 'all 0.2s' }}>
                                        <LogOut size={13} strokeWidth={3} />
                                    </div>
                                    Sign out
                                </LogoutButton>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <div className='ca-page'>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default CertificateApplicationLayout
