import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Compass, LayoutDashboard, Home, Menu, Sparkles, UserCircle2, X } from 'lucide-react'
import LogoutButton from '../../auth/components/LogoutButton'

const navItems = [
  { to: '/search', icon: Home, label: 'Home' },
  { to: '/search/hotels', icon: Building2, label: 'All Hotels' },
  { to: '/search/discovery', icon: Compass, label: 'Discovery' },
]

function navLinkClassName({ isActive }) {
  return [
    'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold leading-none transition',
    isActive
      ? 'border-[#b7c4e6] bg-[#eef2ff] text-[#32467c] shadow-[0_12px_24px_-20px_rgba(42,61,120,0.6)]'
      : 'border-[#cfd8e6] bg-white text-[#61708a] hover:bg-[#f7f9fc]',
  ].join(' ')
}

function SearchNavbar({ user }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className='glass-panel sticky top-0 z-20 w-full rounded-none border-x-0 border-t-0 border-b border-white/70 bg-white/88 px-4 py-3.5 shadow-[0_18px_45px_-34px_rgba(27,40,80,0.42)] backdrop-blur-md sm:px-6 lg:px-8'
    >
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
            <LayoutDashboard size={18} />
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#8c98af]'>Certiguard</p>
            <h1 className='text-lg font-semibold text-[#1f2a44]'>Search Workspace</h1>
          </div>
        </div>

        <motion.div
          className='flex flex-wrap items-center gap-2'
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.to}
                variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.18 }}
              >
                <NavLink to={item.to} className={navLinkClassName}>
                  <Icon size={15} />
                  {item.label}
                </NavLink>
              </motion.div>
            )
          })}
        </motion.div>

        <div className='flex items-center gap-3'>
          <div className='hidden text-right sm:block'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[#8c98af]'>Signed in</p>
            <p className='text-sm font-semibold text-[#1f2a44]'>{user?.name || user?.email || 'Guest'}</p>
          </div>
          <div className='inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfd8e6] bg-[#f7f9fc] text-[#61708a]'>
            <UserCircle2 size={24} />
          </div>
          <LogoutButton className='rounded-full border border-[#cfd8e6] bg-white px-5 py-2.5 text-sm font-semibold leading-none text-[#61708a] transition hover:bg-[#f7f9fc]' />
        </div>
      </div>

      <motion.div
        initial={false}
        animate={isMobileNavOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={[
          'mt-3 overflow-hidden rounded-2xl border border-[#cfd8e6] bg-white transition-[max-height,opacity,transform] duration-200 lg:hidden',
          isMobileNavOpen ? 'max-h-105 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        <div className='flex flex-col gap-2 p-3'>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center gap-2 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition',
                    isActive
                      ? 'border-[#b7c4e6] bg-[#eef2ff] text-[#32467c]'
                      : 'border-[#cfd8e6] bg-white text-[#61708a] hover:bg-[#f7f9fc]',
                  ].join(' ')
                }
              >
                <Icon size={15} />
                {item.label}
              </NavLink>
            )
          })}
          <div className='mt-1 rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm text-[#61708a]'>
            <p className='font-semibold text-[#1f2a44]'>{user?.name || user?.email || 'Guest'}</p>
            <p className='text-xs uppercase tracking-[0.14em] text-[#8c98af]'>{user?.role || 'Authenticated user'}</p>
          </div>
          <LogoutButton className='rounded-xl border border-[#cfd8e6] bg-white px-4 py-3.5 text-sm font-semibold text-[#61708a] transition hover:bg-[#f7f9fc]' />
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default SearchNavbar