import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { path: '', label: 'Overview', end: true, helper: 'Operations snapshot' },
  { path: 'eligible-hotels', label: 'Eligible Hotels', helper: 'Issuance queue' },
  { path: 'issue', label: 'Issue Certificate', helper: 'Create new certificate' },
  { path: 'certificates', label: 'Manage Certificates', helper: 'Lifecycle controls' },
]

function CertificateManagementLayout() {
  const location = useLocation()
  const basePath = location.pathname.startsWith('/admin/certificate-management')
    ? '/admin/certificate-management'
    : '/certificate-management'

  return (
    <div className='space-y-5'>
      <section className='overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='relative bg-linear-to-r from-cyan-900 via-slate-900 to-emerald-900 p-6 text-white'>
          <div className='pointer-events-none absolute -left-20 top-0 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl' />
          <div className='pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-emerald-300/20 blur-3xl' />

          <p className='inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide'>
            Certificate Lifecycle
          </p>
          <h1 className='mt-3 text-3xl font-black'>Certificate Management</h1>
          <p className='mt-2 max-w-3xl text-sm text-slate-200'>
            Manage eligibility, issuance, trust-score health, and lifecycle actions with safer workflows.
          </p>
        </div>

        <nav className='grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-4'>
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.path ? `${basePath}/${tab.path}` : basePath}
              end={tab.end}
              className={({ isActive }) =>
                [
                  'rounded-xl border px-3 py-3 transition',
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
                ].join(' ')
              }
            >
              <p className='text-sm font-semibold'>{tab.label}</p>
              <p className='mt-1 text-xs opacity-80'>{tab.helper}</p>
            </NavLink>
          ))}
        </nav>
      </section>

      <Outlet />
    </div>
  )
}

export default CertificateManagementLayout
