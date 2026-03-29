const STATUS_STYLES = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  EXPIRED: 'border-amber-200 bg-amber-50 text-amber-700',
  REVOKED: 'border-rose-200 bg-rose-50 text-rose-700',
  INACTIVE: 'border-slate-200 bg-slate-100 text-slate-700',
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toUpperCase()
  const tone = STATUS_STYLES[normalizedStatus] || 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {normalizedStatus || 'UNKNOWN'}
    </span>
  )
}

export default StatusBadge
