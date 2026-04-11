import { Award, FileText, LayoutDashboard, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import LogoutButton from '../../auth/components/LogoutButton'
import '../../certificate-application/styles/certificate-application.css'

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

function CertificateManagementLayout() {
    return (
        <div className='ca-shell'>
            <header className='ca-topnav'>
                <div className='ca-topnav-inner'>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div className='ca-logo-mark'>ET</div>
                        <div>
                            <p className='ca-logo-text-main'>Ethical Tourism</p>
                            <p className='ca-logo-text-sub'>Certification Portal</p>
                        </div>
                    </div>

                    {/* Nav pills */}
                    <nav className='ca-nav-pill-group'>
                        <NavPill to='/certificate-application' label='Applications' icon={LayoutDashboard} end />
                        <NavPill to='/certificate-application/new' label='New Application' icon={FileText} />
                        <NavPill to='/certificate-management' label='Certificates' icon={Award} />
                    </nav>

                    {/* Logout */}
                    <LogoutButton
                        className='ca-btn-secondary'
                        style={{ height: '2.4rem', fontSize: '0.8rem' }}
                    >
                        <LogOut size={14} />
                        Log out
                    </LogoutButton>
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

export default CertificateManagementLayout
