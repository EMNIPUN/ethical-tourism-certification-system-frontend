import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { auditApi } from '../api/auditApi'
import { Link } from 'react-router-dom'
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal, 
  Filter,
  ArrowUpRight
} from 'lucide-react'
import { fetchAudits, setAuditFilter } from '../store/auditSlice'

const statusConfig = {
  initiated: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { color: 'bg-amber-100 text-amber-700', icon: ClipboardCheck },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  suspended: { color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
}

function AuditDashboard() {
  const dispatch = useDispatch()
  const [realStats, setRealStats] = useState(null)
  const { items, pagination, filter, status } = useSelector((state) => state.audit)
  const { user, token } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchAudits({ 
      auditor: user?.role === 'Auditor' ? user._id : undefined,
      auditStatus: filter !== 'all' ? filter : undefined,
      page: pagination.page,
      limit: pagination.limit
    }))
  }, [dispatch, filter, pagination.page, pagination.limit, user])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await auditApi.getAuditStats(
          { auditor: user?.role === 'Auditor' ? user._id : undefined },
          token
        )
        setRealStats(stats.data)
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }
    if (token) loadStats()
  }, [user, token])

  const stats = [
    { label: 'Total Audits', value: realStats?.totalAudits || 0, icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: realStats?.inProgressAudits || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: realStats?.completedAudits || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className='fade-up space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[#1f2b49]'>Audit Management</h1>
          <p className='text-sm text-[#5f6f8c]'>Overview of all certification audits and assessments.</p>
        </div>
        <div className='flex gap-3'>
          <button className='btn-subtle flex items-center gap-2'>
            <Filter size={14} />
            Filter
          </button>
          {user?.role === 'Admin' && (
            <button className='btn-primary'>
              Initialize New Audit
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
        {stats.map((stat, i) => (
          <div key={i} className='glass-panel rounded-2xl p-5'>
            <div className='flex items-center gap-4'>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className='text-xs font-bold uppercase tracking-wider text-[#8d98af]'>{stat.label}</p>
                <div className='flex items-baseline gap-2'>
                  <p className='text-2xl font-bold text-[#1f2b49]'>{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='workspace-content'>
        <div className='mb-5 flex items-center justify-between'>
          <div className='flex gap-1.5'>
            {['all', 'initiated', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => dispatch(setAuditFilter(f))}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filter === f 
                    ? 'bg-[var(--brand-600)] text-white' 
                    : 'bg-[#f4f7fc] text-[#5f6f8c] hover:bg-[#e9edf7]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className='overflow-hidden rounded-xl border border-[#eef2f8]'>
          <table className='w-full text-left'>
            <thead className='bg-[#f9fbff] text-[11px] font-bold uppercase tracking-wider text-[#8d98af]'>
              <tr>
                <th className='px-6 py-4'>Hotel / Business</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4'>Score</th>
                <th className='px-6 py-4'>Recommendation</th>
                <th className='px-6 py-4'>Started</th>
                <th className='px-6 py-4 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[#f2f6fc] bg-white'>
              {items.length === 0 ? (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center text-sm text-[#8d98af]'>
                    No audits found.
                  </td>
                </tr>
              ) : (
                items.map((audit) => {
                  const status = statusConfig[audit.auditStatus] || statusConfig.initiated
                  const StatusIcon = status.icon
                  return (
                    <tr key={audit._id} className='transition hover:bg-[#f9fbff]/50'>
                      <td className='px-6 py-4'>
                        <div>
                          <p className='text-sm font-bold text-[#1f2b49]'>{audit.hotel?.businessInfo?.name || 'N/A'}</p>
                          <p className='mt-0.5 text-xs text-[#8d98af]'>ID: {audit._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                          <StatusIcon size={12} />
                          {audit.auditStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='h-1.5 w-16 overflow-hidden rounded-full bg-[#eee]'>
                            <div 
                              className='h-full bg-[var(--brand-600)]' 
                              style={{ width: `${audit.overallScore || 0}%` }}
                            />
                          </div>
                          <span className='text-xs font-bold text-[#1f2b49]'>{Math.round(audit.overallScore || 0)}%</span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`text-xs font-semibold ${
                          audit.recommendation === 'approve' ? 'text-emerald-600' : 
                          audit.recommendation === 'reject' ? 'text-rose-600' : 'text-[#8d98af]'
                        }`}>
                          {audit.recommendation ? audit.recommendation.replace('_', ' ') : 'Pending'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <p className='text-xs text-[#5f6f8c]'>{new Date(audit.auditStartDate).toLocaleDateString()}</p>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <Link 
                          to={`/audit/${audit._id}`}
                          className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4ff] text-[var(--brand-700)] transition hover:bg-[var(--brand-600)] hover:text-white'
                        >
                          <ArrowUpRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditDashboard
