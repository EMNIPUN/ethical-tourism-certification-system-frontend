const LEVEL_STYLES = {
  PLATINUM: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  GOLD: 'border-amber-200 bg-amber-50 text-amber-700',
  SILVER: 'border-zinc-300 bg-zinc-100 text-zinc-700',
}

const LEVEL_ICON_STYLES = {
  PLATINUM: {
    medal: 'bg-cyan-500',
    ribbonLeft: 'bg-cyan-700',
    ribbonRight: 'bg-cyan-600',
  },
  GOLD: {
    medal: 'bg-amber-500',
    ribbonLeft: 'bg-amber-700',
    ribbonRight: 'bg-amber-600',
  },
  SILVER: {
    medal: 'bg-zinc-500',
    ribbonLeft: 'bg-zinc-700',
    ribbonRight: 'bg-zinc-600',
  },
}

function LevelMedalIcon({ level }) {
  const iconTone = LEVEL_ICON_STYLES[level] || {
    medal: 'bg-slate-500',
    ribbonLeft: 'bg-slate-700',
    ribbonRight: 'bg-slate-600',
  }

  return (
    <span className='relative inline-flex h-4 w-4 items-end justify-center' aria-hidden='true'>
      <span className={`absolute left-px top-0 h-2 w-1.5 -skew-x-12 rounded-b-sm ${iconTone.ribbonLeft}`} />
      <span className={`absolute right-px top-0 h-2 w-1.5 skew-x-12 rounded-b-sm ${iconTone.ribbonRight}`} />
      <span className={`absolute bottom-0 inline-flex h-2.5 w-2.5 rounded-full ring-1 ring-white ${iconTone.medal}`} />
    </span>
  )
}

function LevelBadge({ level }) {
  const normalizedLevel = String(level || '').toUpperCase()
  const tone = LEVEL_STYLES[normalizedLevel] || 'border-slate-200 bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <LevelMedalIcon level={normalizedLevel} />
      {normalizedLevel || 'N/A'}
    </span>
  )
}

export default LevelBadge
