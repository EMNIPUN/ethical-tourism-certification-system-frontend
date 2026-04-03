import { Bell, CircleHelp, ClipboardCheck, LayoutDashboard, Search, ShieldCheck, Hotel, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import LogoutButton from '../../auth/components/LogoutButton'

const sidebarLinks = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/admin/certificate-management',
    label: 'Certificate Management',
    icon: ShieldCheck,
  },
  {
    to: '/admin/user-management',
    label: 'User Management',
    icon: Users,
  },
  {
    to: '/admin/audit-management',
    label: 'Audit Management',
    icon: ClipboardCheck,
  },
  {
    to: '/admin/hotel-management',
    label: 'Hotel Management',
    icon: Hotel,
  },
]

function AdminLayout() {
  return (
    <div className='h-screen w-screen overflow-hidden bg-[var(--surface-canvas)]'>
      <div className='flex h-full w-full overflow-hidden border border-[#d6deec] bg-[#f8fafe] shadow-[0_24px_55px_-36px_rgba(23,36,66,0.5)]'>
        <aside className='sticky top-0 flex h-screen w-[322px] shrink-0 flex-col border-r border-[#e2e8f2] bg-[#fbfcff] px-5 py-6'>
          <div className='inline-flex items-center gap-2'>
            
            <div>
              <p className='text-[30px] font-semibold leading-none tracking-tight text-[#333]'>Certiguard</p>
            </div>
          </div>
          

          <p className='mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d98af]'>Main Menu</p>

          <nav className='mt-3 space-y-1.5'>
            {sidebarLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
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
              )
            })}
          </nav>

          <LogoutButton className='mt-auto rounded-md cursor-pointer border border-[#d5dcea] bg-white px-3 py-2 text-sm font-semibold text-[#48577a] transition hover:bg-[#f2f6ff]' />
        </aside>

        <main className='flex h-full flex-1 flex-col overflow-hidden bg-[#f6f8fd]'>
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e9f3] bg-[#f6f8fd] px-6 py-4'>
            <label className='relative w-full max-w-[390px]'>
              <Search size={16} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#95a2ba]' />
              <input
                type='text'
                placeholder='Search certificates, hotels, audits...'
                className='h-11 w-full rounded-xl border border-[#dde4f1] bg-white pl-10 pr-4 text-sm text-[#354564] outline-none transition focus:border-[var(--brand-700)] focus:ring-4 focus:ring-[var(--brand-700)]/15'
              />
            </label>

            <div className='ml-4 flex items-center gap-2.5'>
              <button
                type='button'
                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce4f1] bg-white text-[#61708d] transition hover:text-[var(--brand-700)]'
              >
                <Bell size={16} />
              </button>
              <button
                type='button'
                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dce4f1] bg-white text-[#61708d] transition hover:text-[var(--brand-700)]'
              >
                <CircleHelp size={16} />
              </button>
              
            </div>
          </header>

          <div className='app-scrollbar flex-1 overflow-y-auto p-6'>
            <div className='min-h-full'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

