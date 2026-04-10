import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Compass,
  Home,
  Menu,
  MessageSquareText,
  Sparkles,
  UserCircle2,
  X,
} from 'lucide-react'
import LogoutButton from '../../auth/components/LogoutButton'

function SearchNavbar({ user, onShowAll, onRefreshRecommendations, onScrollToFeedback, onDiscover }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  function handleMobileAction(callback) {
    setIsMobileNavOpen(false)
    callback()
  }

  return (
    <nav className='glass-panel sticky top-0 z-20 w-full rounded-none border-x-0 border-t-0 border-b border-white/70 bg-white/88 px-4 py-3 shadow-[0_18px_45px_-34px_rgba(27,40,80,0.42)] backdrop-blur-md sm:px-6 lg:px-8'>
      <div className='flex items-center justify-between gap-3 lg:hidden'>
        <div className='flex items-center gap-3'>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5868d8] text-white shadow-[0_14px_26px_-18px_rgba(39,54,122,0.7)]'>
            <Sparkles size={18} />
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#8c98af]'>Certiguard</p>
            <h1 className='text-lg font-semibold text-[#1f2a44]'>Hotel Search</h1>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfd8e6] bg-[#f7f9fc] text-[#61708a]'>
            <UserCircle2 size={24} />
          </div>
          <button
            type='button'
            onClick={() => setIsMobileNavOpen((current) => !current)}
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfd8e6] bg-white text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className='hidden lg:flex lg:items-center lg:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5868d8] text-white shadow-[0_14px_26px_-18px_rgba(39,54,122,0.7)]'>
            <Sparkles size={18} />
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#8c98af]'>Certiguard</p>
            <h1 className='text-lg font-semibold text-[#1f2a44]'>Hotel Search</h1>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Home size={15} />
            Home
          </Link>
          <button
            type='button'
            onClick={onShowAll}
            className='inline-flex items-center gap-2 rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Building2 size={15} />
            All Hotels
          </button>
          <button
            type='button'
            onClick={onRefreshRecommendations}
            className='inline-flex items-center gap-2 rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Sparkles size={15} />
            AI Ranking
          </button>
          <button
            type='button'
            onClick={onScrollToFeedback}
            className='inline-flex items-center gap-2 rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <MessageSquareText size={15} />
            Feedback
          </button>
          <button
            type='button'
            onClick={onDiscover}
            className='inline-flex items-center gap-2 rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Compass size={15} />
            Discover
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <div className='hidden text-right sm:block'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#8c98af]'>Signed in</p>
            <p className='text-sm font-semibold text-[#1f2a44]'>{user?.name || user?.email || 'Guest'}</p>
          </div>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfd8e6] bg-[#f7f9fc] text-[#61708a]'>
            <UserCircle2 size={24} />
          </div>
          <LogoutButton className='rounded-full border border-[#cfd8e6] bg-white px-4 py-2 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]' />
        </div>
      </div>

      <div
        className={[
          'mt-3 overflow-hidden rounded-2xl border border-[#cfd8e6] bg-white transition-[max-height,opacity,transform] duration-200 lg:hidden',
          isMobileNavOpen ? 'max-h-105 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        <div className='flex flex-col gap-2 p-3'>
          <Link
            to='/'
            onClick={() => setIsMobileNavOpen(false)}
            className='inline-flex items-center gap-2 rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Home size={15} />
            Home
          </Link>
          <button
            type='button'
            onClick={() => handleMobileAction(onShowAll)}
            className='inline-flex items-center gap-2 rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-left text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Building2 size={15} />
            All Hotels
          </button>
          <button
            type='button'
            onClick={() => handleMobileAction(onRefreshRecommendations)}
            className='inline-flex items-center gap-2 rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-left text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Sparkles size={15} />
            AI Ranking
          </button>
          <button
            type='button'
            onClick={() => handleMobileAction(onScrollToFeedback)}
            className='inline-flex items-center gap-2 rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-left text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <MessageSquareText size={15} />
            Feedback
          </button>
          <button
            type='button'
            onClick={() => handleMobileAction(onDiscover)}
            className='inline-flex items-center gap-2 rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-left text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]'
          >
            <Compass size={15} />
            Discover
          </button>
          <div className='mt-1 rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm text-[#61708a]'>
            <p className='font-semibold text-[#1f2a44]'>{user?.name || user?.email || 'Guest'}</p>
            <p className='text-xs uppercase tracking-[0.14em] text-[#8c98af]'>{user?.role || 'Authenticated user'}</p>
          </div>
          <LogoutButton className='rounded-xl border border-[#cfd8e6] bg-white px-4 py-3 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]' />
        </div>
      </div>
    </nav>
  )
}

export default SearchNavbar