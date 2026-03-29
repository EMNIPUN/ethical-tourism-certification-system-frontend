const LEVEL_STYLES = {
  PLATINUM: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  GOLD: 'border-amber-200 bg-amber-50 text-amber-700',
  SILVER: 'border-zinc-300 bg-zinc-100 text-zinc-700',
}

function LevelBadge({ level }) {
  const normalizedLevel = String(level || '').toUpperCase()
  const tone = LEVEL_STYLES[normalizedLevel] || 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {normalizedLevel || 'N/A'}
    </span>
  )
}

export default LevelBadge
