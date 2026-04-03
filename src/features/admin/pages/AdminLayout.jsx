import { NavLink, Outlet } from 'react-router-dom'

const sidebarLinks = [
  {
    to: '/admin/certificate-management',
    label: 'Certificate Management',
    helper: 'Issue and manage certificates',
  },
  {
    to: '/admin/user-management',
    label: 'User Management',
    helper: 'Example admin module page',
  },
  {
    to: '/admin/audit-management',
    label: 'Audit Management',
    helper: 'Example admin module page',
  },
  {
    to: '/admin/hotel-management',
    label: 'Hotel Management',
    helper: 'Example admin module page',
  },
]

function AdminLayout() {
  return (
    <div className='min-h-screen bg-slate-100'>
      <aside className='fixed inset-y-0 left-0 z-20 w-72 border-r border-slate-200 bg-slate-900 p-5 text-slate-100'>
        <h1 className='text-2xl font-black tracking-tight'>Admin Panel</h1>
        <p className='mt-2 text-xs text-slate-300'>Ethical Tourism Certification System</p>

        <nav className='mt-8 space-y-2'>
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'block rounded-xl border px-3 py-3 transition',
                  isActive
                    ? 'border-cyan-300 bg-cyan-100 text-slate-900'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700',
                ].join(' ')
              }
            >
              <p className='text-sm font-semibold'>{item.label}</p>
              <p className='mt-1 text-xs opacity-80'>{item.helper}</p>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className='ml-72 min-h-screen p-6 md:p-8'>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
