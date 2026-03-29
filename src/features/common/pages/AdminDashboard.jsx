const dashboardCards = [
  {
    title: 'Active Certificates',
    value: '1,284',
    trend: '+6.5% this month',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  {
    title: 'Pending Reviews',
    value: '42',
    trend: '-8.1% this week',
    color: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    title: 'Hotels Managed',
    value: '365',
    trend: '+12 new this quarter',
    color: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  {
    title: 'Audit Flags',
    value: '9',
    trend: '2 require immediate action',
    color: 'border-rose-200 bg-rose-50 text-rose-800',
  },
]

const recentItems = [
  {
    title: 'Certificate CERT-10034 renewed',
    detail: 'Green Valley Resort',
    time: '12 minutes ago',
  },
  {
    title: 'New hotel profile submitted',
    detail: 'Sunrise Bay Hotel',
    time: '38 minutes ago',
  },
  {
    title: 'Audit checklist completed',
    detail: 'Ocean Pearl Retreat',
    time: '1 hour ago',
  },
  {
    title: 'Trust score recalculated',
    detail: 'Mountain Leaf Lodge',
    time: '2 hours ago',
  },
]

function AdminDashboard() {
  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700'>
          Dashboard Overview
        </p>
        <h2 className='mt-3 text-3xl font-black text-slate-900'>System Operations Hub</h2>
        <p className='mt-2 max-w-3xl text-sm text-slate-600'>
          Welcome to the admin dashboard. Use the sidebar to switch between certificate, user, audit, and hotel
          management pages while keeping this fixed control panel layout.
        </p>
      </section>

      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {dashboardCards.map((card) => (
          <article key={card.title} className={`rounded-2xl border p-5 shadow-sm ${card.color}`}>
            <p className='text-xs font-semibold uppercase tracking-wide'>{card.title}</p>
            <p className='mt-2 text-3xl font-black'>{card.value}</p>
            <p className='mt-2 text-xs'>{card.trend}</p>
          </article>
        ))}
      </section>

      <section className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2'>
          <h3 className='text-lg font-bold text-slate-900'>Recent Activity</h3>
          <ul className='mt-4 space-y-3'>
            {recentItems.map((item) => (
              <li key={item.title} className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
                <p className='text-sm font-semibold text-slate-800'>{item.title}</p>
                <p className='mt-1 text-xs text-slate-600'>{item.detail}</p>
                <p className='mt-1 text-xs text-slate-500'>{item.time}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h3 className='text-lg font-bold text-slate-900'>Health Snapshot</h3>
          <div className='mt-4 space-y-3'>
            <div className='rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              Uptime: 99.95%
            </div>
            <div className='rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              Queue Processing: Normal
            </div>
            <div className='rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              Last Backup: Today 02:15 AM
            </div>
            <div className='rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700'>
              Alert Level: Low
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default AdminDashboard
