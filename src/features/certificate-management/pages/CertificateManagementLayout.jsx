import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '.', label: 'Overview', end: true },
  { to: 'eligible-hotels', label: 'Eligible Hotels' },
  { to: 'issue', label: 'Issue Certificate' },
  { to: 'certificates', label: 'Manage Certificates' },
]

function CertificateManagementLayout() {
  return (
    <div className='space-y-5'>
      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700'>
          Certificate Lifecycle
        </p>
        <h1 className='mt-3 text-3xl font-black text-slate-900'>Certificate Management</h1>
        <p className='mt-2 max-w-3xl text-sm text-slate-600'>
          Manage eligibility, issue certificates, and handle full lifecycle actions with dedicated admin workflows.
        </p>

        <nav className='mt-5 flex flex-wrap gap-2'>
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                [
                  'rounded-lg border px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
                ].join(' ')
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </section>

      <Outlet />
    </div>
  )
}

export default CertificateManagementLayout
