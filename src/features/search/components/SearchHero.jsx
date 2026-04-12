import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Globe2, RefreshCw, Search, Sparkles, UserCircle2, Zap } from 'lucide-react'

const HERO_IMAGES = [
  {
    url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/490904217.jpg?k=45ec65ba1cddfef5e2ec55e52641dfeed9771855c82027f4d69909f16f25de5b&o=',
    label: 'Coastal certified stay',
  },
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    label: 'Rainforest eco retreat',
  },
  {
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
    label: 'Mountain heritage lodge',
  },
]

function SearchHero({
  user,
  searchInput,
  setSearchInput,
  onSearch,
  onShowAll,
  onRefreshRecommendations,
  isRefreshingRecommendations = false,
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % HERO_IMAGES.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className='relative w-full overflow-hidden rounded-none border-x-0 border border-white/70 px-4 py-5 shadow-[0_28px_65px_-44px_rgba(18,29,58,0.55)] sm:px-6 sm:py-6 lg:px-8'
    >
      <div className='absolute inset-0'>
        {HERO_IMAGES.map((image, imageIndex) => (
          <div
            key={image.url}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out ${
              imageIndex === activeImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${image.url}')` }}
          />
        ))}
        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(27,40,80,0.18),rgba(27,40,80,0.64))]' />
      </div>

      <div className='absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[rgba(27,40,80,0.2)] px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm'>
        <Globe2 size={12} />
        {HERO_IMAGES[activeImageIndex].label}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className='relative flex min-h-135 flex-col justify-between gap-6 rounded-4xl border border-white/20 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm sm:p-6 lg:min-h-145 lg:p-8'
      >
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-3xl rounded-4xl border border-white/18 bg-white/18 p-5 shadow-[0_18px_40px_-26px_rgba(27,40,80,0.7)] backdrop-blur-sm sm:p-6'>
            <div className='badge-chip border-white/20 bg-white/20 text-white'>
              <Sparkles size={12} />
              Ethical tourism discovery
            </div>
            <h1 className='mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl'>
              Search certified hotels and compare trust signals in one place.
            </h1>
            <p className='mt-3 max-w-2xl text-sm text-white/85 sm:text-base'>
              Explore active certificates, filter by location, inspect guest feedback, and switch to AI-ranked
              recommendations without leaving the dashboard.
            </p>

            {user ? (
              <p className='mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm'>
                <UserCircle2 size={13} />
                Signed in as {user.name || user.email || 'trusted traveler'}
              </p>
            ) : null}
          </div>

          <div className='hidden items-center gap-2 self-start rounded-full border border-white/25 bg-black/25 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-sm lg:inline-flex'>
            {HERO_IMAGES.map((image, imageIndex) => (
              <button
                type='button'
                key={image.url}
                onClick={() => setActiveImageIndex(imageIndex)}
                aria-label={`Show ${image.label}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  imageIndex === activeImageIndex ? 'bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.28)]' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        <form
          onSubmit={onSearch}
          className='grid gap-4 rounded-3xl border border-white/25 bg-black/20 p-3 shadow-[0_24px_45px_-30px_rgba(3,10,20,0.8)] backdrop-blur-md lg:grid-cols-[minmax(0,1fr)_auto_auto]'
        >
          <label className='relative block'>
            <Search size={18} className='pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#5e6d88]' />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              type='text'
              placeholder='Search by city, district, or eco-tourism area'
              className='h-14 w-full rounded-2xl border border-white/60 bg-white pl-12 pr-4 text-sm font-medium text-[#1f2a44] outline-none transition focus:border-[#5868d8] focus:ring-4 focus:ring-[rgba(88,104,216,0.2)]'
            />
          </label>

          <motion.button
            type='submit'
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className='inline-flex h-14 items-center justify-center rounded-2xl border border-[#cfd8e6] bg-white px-6 text-sm font-semibold text-[#1f2a44] transition hover:bg-[#f7f9fc]'
          >
            Search now
          </motion.button>

          <motion.button
            type='button'
            onClick={onRefreshRecommendations}
            disabled={isRefreshingRecommendations}
            aria-busy={isRefreshingRecommendations}
            whileHover={isRefreshingRecommendations ? undefined : { y: -1 }}
            whileTap={isRefreshingRecommendations ? undefined : { scale: 0.98 }}
            className={[
              'inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-[rgba(111,124,255,0.28)]',
              isRefreshingRecommendations
                ? 'cursor-not-allowed bg-[linear-gradient(135deg,#27367a,#5868d8)] shadow-[0_12px_28px_-14px_rgba(39,54,122,0.45)]'
                : 'bg-[linear-gradient(135deg,#27367a,#6f7cff)] shadow-[0_12px_28px_-14px_rgba(39,54,122,0.82)] hover:brightness-110',
            ].join(' ')}
          >
            <Zap size={16} className={isRefreshingRecommendations ? 'animate-spin' : ''} />
            {isRefreshingRecommendations ? (
              <span className='inline-flex items-center gap-2'>
                Ranking...
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white/90' />
              </span>
            ) : (
              'AI ranking'
            )}
          </motion.button>

          <motion.button
            type='button'
            onClick={onShowAll}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#cfd8e6] bg-white/90 px-4 text-xs font-semibold text-[#61708a] backdrop-blur-sm transition hover:bg-white lg:col-start-2'
          >
            <RefreshCw size={14} />
            Show all results
          </motion.button>
        </form>

        <div className='flex flex-wrap items-center gap-2 text-xs text-white/90'>
          <span className='badge-chip border-white/20 bg-white/15 text-white'>
            <CheckCircle2 size={12} />
            Protected hotel discovery
          </span>
          <span className='badge-chip border-white/20 bg-white/15 text-white'>
            <Globe2 size={12} />
            Contacts and recommendations via backend search module
          </span>
        </div>
      </motion.div>
    </motion.section>
  )
}

export default SearchHero