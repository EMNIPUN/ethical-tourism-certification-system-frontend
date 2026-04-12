import { useState } from 'react'
import {
  Bell,
  BookOpenText,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FilePlus2,
  ListChecks,
  Search,
  ShieldCheck,
  Hotel,
  Users,
  Menu,
  ChevronLeft
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import LogoutButton from '../../auth/components/LogoutButton'

const sidebarLinks = [
  { to: '/admin/certificate-management', label: 'Certificates', icon: ShieldCheck },
  { to: '/admin/audit-initialize', label: 'Initialize Audit', icon: FilePlus2 },
  // { to: '/admin/user-management', label: 'Users', icon: Users },
  { to: '/admin/audit-management', label: 'Audits', icon: ClipboardCheck },
  // { to: '/admin/hotel-management', label: 'Hotels', icon: Hotel },
]

const certificateManagementSubLinks = [
  { to: '/admin/certificate-management', label: 'Overview', icon: BookOpenText, end: true },
  { to: '/admin/certificate-management/issuance', label: 'Issuance Hub', icon: FilePlus2 },
  { to: '/admin/certificate-management/certificates', label: 'Manage Certificates', icon: ListChecks },
]

function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isCertificateManagementExpanded, setIsCertificateManagementExpanded] = useState(true)

  return (
    <div className='h-screen w-screen overflow-hidden bg-[var(--surface-canvas)]'>
      <div className='flex h-full w-full overflow-hidden border border-[#d6deec] bg-[#f8fafe] shadow-2xl transition-all duration-500'>
        {/* SIDEBAR */}
        <aside 
          className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#e2e8f2] bg-[#fbfcff] transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20 px-3 py-6' : 'w-[280px] px-5 py-6'
          }`}
        >
          {/* Logo & Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-10`}>
            {!isCollapsed && <p className='text-2xl font-black tracking-tight text-[#1f2b49]'>Certiguard</p>}
            {/* <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4ff] text-[var(--brand-700)] hover:bg-[var(--brand-600)] hover:text-white transition shadow-sm'
            >
              {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button> */}
          </div>

          {!isCollapsed && <p className='mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d98af]'>Main Menu</p>}

          <nav className='space-y-1.5'>
            {sidebarLinks.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.to}>
                  {item.to === '/admin/certificate-management' ? (
                    <div>
                      <NavLink
                        end={item.to === '/admin'}
                        to={item.to}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[15px] font-medium transition',
                            isActive
                              ? 'bg-[var(--brand-600)] text-white shadow-[0_14px_28px_-20px_rgba(87,105,216,0.95)]'
                              : 'text-[#4f5b72] hover:bg-[#edf2fc]',
                          ].join(' ')
                        }
                      >
                        <Icon size={16} />
                        <span className='flex-1'>{item.label}</span>

                        <span
                          role='button'
                          tabIndex={0}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setIsCertificateManagementExpanded((current) => !current)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              event.stopPropagation()
                              setIsCertificateManagementExpanded((current) => !current)
                            }
                          }}
                          className='inline-flex h-5 w-5 items-center justify-center rounded-sm'
                          aria-label={
                            isCertificateManagementExpanded
                              ? 'Collapse certificate management links'
                              : 'Expand certificate management links'
                          }
                        >
                          {isCertificateManagementExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                      </NavLink>
                    </div>
                  ) : (
                    <NavLink
                      end={item.to === '/admin'}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[15px] font-medium transition',
                          isActive
                            ? 'bg-[var(--brand-600)] text-white shadow-[0_14px_28px_-20px_rgba(87,105,216,0.95)]'
                            : 'text-[#4f5b72] hover:bg-[#edf2fc]',
                        ].join(' ')
                      }
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  )}

                  {item.to === '/admin/certificate-management' && isCertificateManagementExpanded ? (
                    <div className='mt-1.5 space-y-1 pl-7'>
                      {certificateManagementSubLinks.map((subLink) => {
                        const SubIcon = subLink.icon
                        return (
                          <NavLink
                            key={subLink.to}
                            to={subLink.to}
                            end={subLink.end}
                            className={({ isActive }) =>
                              [
                                'flex items-center gap-2 rounded-md border-l-2 border-transparent px-2.5 py-1.5 text-[14px] font-medium transition',
                                isActive
                                  ? 'border-[var(--brand-600)] text-[#2d4cbd]'
                                  : 'text-[#5e6c86] hover:border-[#c8d3ea] hover:text-[#445072]',
                              ].join(' ')
                            }
                          >
                            <SubIcon size={14} />
                            <span>{subLink.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>

          <div className='mt-auto flex flex-col gap-4'>
            <LogoutButton isCollapsed={isCollapsed} className={`flex items-center gap-3 rounded-xl border border-[#dce4f1] bg-white py-2.5 text-sm font-bold text-[#48577a] transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 ${isCollapsed ? 'justify-center px-0 h-12 w-12 mx-auto' : 'px-4'}`} />
          </div>
        </aside>

        {/* MAIN */}
        <main className='flex h-full flex-1 flex-col overflow-hidden bg-[#f6f8fd]'>
          <header className='sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e3e9f3] bg-[#f6f8fd]/80 backdrop-blur-md px-8 py-4'>
            <div className='flex items-center gap-4 w-full max-w-xl'>
              <label className='relative flex-1'>
                <Search size={16} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95a2ba]' />
                <input
                  type='text'
                  placeholder='Quick search filters...'
                  className='h-12 w-full rounded-2xl border border-[#dde4f1] bg-white pl-12 pr-4 text-sm font-semibold text-[#1f2b49] outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10'
                />
              </label>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex h-10 items-center gap-2 rounded-xl bg-white px-3 border border-[#eef2f8] shadow-sm'>
                <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[10px] font-black uppercase text-[#1f2b49]'>System Online</span>
              </div>
              <button className='flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#dde4f1] text-[#5f6f8c] hover:text-[var(--brand-600)] transition shadow-sm'>
                <Bell size={20} />
              </button>
              <div className='h-10 w-10 overflow-hidden rounded-xl border-2 border-[var(--brand-100)] shadow-sm'>
                 <img src={`https://ui-avatars.com/api/?name=Admin&background=5769d8&color=fff`} alt='User' />
              </div>
            </div>
          </header>

          <div className='app-scrollbar flex-1 overflow-y-auto p-8'>
            <div className='mx-auto width-full '>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

