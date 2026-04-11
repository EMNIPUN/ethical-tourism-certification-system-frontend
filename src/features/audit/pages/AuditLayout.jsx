import { useState } from 'react'
import { Bell, CircleHelp, ClipboardCheck, LayoutDashboard, Search, Settings, ChevronLeft, Menu } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LogoutButton from '../../auth/components/LogoutButton'

const sidebarLinks = [
  { to: '/audit', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/audit/my-assessments', label: 'My Assessments', icon: ClipboardCheck },
  { to: '/audit/settings', label: 'Settings', icon: Settings },
]

function AuditLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useSelector((state) => state.auth)

  return (
    <div className='h-screen w-screen overflow-hidden bg-[var(--surface-canvas)]'>
      <div className='flex h-full w-full overflow-hidden border border-[#d6deec] bg-[#f8fafe] shadow-2xl transition-all duration-500'>
        {/* AUDIT SIDEBAR */}
        <aside 
          className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#e2e8f2] bg-[#fbfcff] transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20 px-3 py-6' : 'w-[280px] px-5 py-6'
          }`}
        >
          {/* Portal Logo & Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-10`}>
            {!isCollapsed && (
              <div className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-800)] text-white shadow-lg'>
                  <ClipboardCheck size={18} />
                </div>
                <p className='text-lg font-black tracking-tight text-[#1f2b49]'>AuditPortal</p>
              </div>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4ff] text-[var(--brand-700)] hover:bg-[var(--brand-600)] hover:text-white transition shadow-sm'
            >
              {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!isCollapsed && <p className='mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#8d98af]'>Audit Operations</p>}

          <nav className='space-y-1.5'>
            {sidebarLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  end={item.to === '/audit'}
                  to={item.to}
                  title={isCollapsed ? item.label : ''}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-xl py-3 transition-all duration-200',
                      isCollapsed ? 'justify-center px-0' : 'px-4',
                      isActive
                        ? 'bg-[var(--brand-600)] text-white shadow-lg shadow-[var(--brand-600)]/20 shadow-brand-link'
                        : 'text-[#5f6f8c] hover:bg-[#f4f7fc] hover:text-[var(--brand-700)]',
                    ].join(' ')
                  }
                >
                  <Icon size={isCollapsed ? 22 : 18} />
                  {!isCollapsed && <span className='text-sm font-bold'>{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className='mt-auto flex flex-col gap-4'>
            {!isCollapsed && (
              <div className='rounded-xl border border-[#e3ebf7] bg-white p-4 shadow-sm'>
                <p className='text-xs font-bold text-[#1f2b49]'>Portal Sync</p>
                <div className='mt-2 flex items-center gap-2'>
                  <div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  <p className='text-[10px] font-bold text-[#5f6f8c]'>Real-time tracking active</p>
                </div>
              </div>
            )}
            <LogoutButton isCollapsed={isCollapsed} className={`flex items-center gap-3 rounded-xl border border-[#dce4f1] bg-white py-2.5 text-sm font-bold text-[#48577a] transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 ${isCollapsed ? 'justify-center px-0 h-12 w-12 mx-auto' : 'px-4'}`} />
          </div>
        </aside>

        {/* AUDIT MAIN CONTENT */}
        <main className='flex h-full flex-1 flex-col overflow-hidden bg-[#f6f8fd]'>
          <header className='sticky top-0 z-10 flex h-20 items-center justify-between border-b border-[#e3e9f3] bg-[#f6f8fd]/80 backdrop-blur-md px-8 py-4'>
            <div className='flex items-center gap-4 w-full max-w-xl'>
              <label className='relative flex-1'>
                <Search size={16} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95a2ba]' />
                <input
                  type='text'
                  placeholder='Search audit records, evidence, or guidelines...'
                  className='h-12 w-full rounded-2xl border border-[#dde4f1] bg-white pl-12 pr-4 text-sm font-semibold text-[#1f2b49] outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10'
                />
              </label>
            </div>

            <div className='flex items-center gap-4'>
               <div className='flex h-10 items-center gap-2 rounded-xl bg-white px-3 border border-[#eef2f8] shadow-sm'>
                <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[10px] font-black uppercase text-[#1f2b49]'>Active Session</span>
              </div>
              <button className='flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#dde4f1] text-[#5f6f8c] hover:text-[var(--brand-600)] transition shadow-sm'>
                <Bell size={20} />
              </button>
              <div className='flex items-center gap-3 pl-2'>
                <div className='text-right hidden sm:block'>
                   <p className='text-xs font-black text-[#1f2b49]'>{user?.name || 'Assessor'}</p>
                   <p className='text-[10px] font-bold text-[#8d98af] uppercase tracking-wider'>{user?.role || 'Auditor'}</p>
                </div>
                <div className='h-10 w-10 overflow-hidden rounded-xl border-2 border-[var(--brand-100)] shadow-sm'>
                   <img src={`https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=5769d8&color=fff`} alt='User' />
                </div>
              </div>
            </div>
          </header>

          <div className='app-scrollbar flex-1 overflow-y-auto p-8'>
            <div className='mx-auto max-w-[1400px]'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuditLayout
