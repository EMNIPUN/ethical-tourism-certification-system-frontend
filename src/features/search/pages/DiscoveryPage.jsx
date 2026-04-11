import { useEffect } from 'react'
import { Compass, Globe2, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import SearchNavbar from '../components/SearchNavbar'
import { loadHotelContacts, loadHotelRecommendations } from '../store/searchSlice'
import {
  selectSearchContacts,
  selectSearchContactsStatus,
  selectSearchRecommendations,
  selectSearchRecommendationsStatus,
} from '../store/searchSelectors'

const DISCOVERY_IMAGES = [
  {
    url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/621706808.jpg?k=cbf5a0764827cedcfb9814d62c2cf1ef53902ab199b229e51e39e5e9f3e12662&o=',
    title: 'Coastal Sustainability Resort',
    subtitle: 'Ocean-friendly operations with transparent certification evidence',
  },
  {
    url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/621706709.jpg?k=77d51e851220838459d502a4dc527b040f369d9d96831815e982dfde4489319d&o=',
    title: 'Eco-Luxury Stay',
    subtitle: 'Energy-smart comfort and responsible hospitality standards',
  },
  {
    url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/466569780.jpg?k=d6476a7f5fe6dcb177844b418b05d194f790e7389da99026e39f52803e470fa4&o=',
    title: 'Community Impact Hotel',
    subtitle: 'Locally rooted tourism with verified social and labor commitments',
  },
]

function DiscoveryPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const contacts = useAppSelector(selectSearchContacts)
  const contactsStatus = useAppSelector(selectSearchContactsStatus)
  const recommendations = useAppSelector(selectSearchRecommendations)
  const recommendationsStatus = useAppSelector(selectSearchRecommendationsStatus)

  useEffect(() => {
    if (contactsStatus === 'idle') {
      dispatch(loadHotelContacts())
    }

    if (recommendationsStatus === 'idle') {
      dispatch(loadHotelRecommendations())
    }
  }, [contactsStatus, dispatch, recommendationsStatus])

  const topHotels = recommendations?.topHotels || []
  const totalHotels = contacts.length

  return (
    <main className='min-h-screen w-full overflow-x-hidden'>
      <div className='flex min-h-screen w-full flex-col gap-5'>
        <SearchNavbar user={user} />

        <section className='w-full px-4 pt-4 sm:px-6 lg:px-8'>
          <div className='glass-panel rounded-3xl border border-white/70 bg-white/84 p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.15em] text-[#7b88a0]'>Discovery</p>
            <h1 className='mt-2 text-3xl font-semibold text-[#17253f] sm:text-4xl'>Explore Ethical Destinations</h1>
            <p className='mt-2 max-w-3xl text-sm text-[#65748d] sm:text-base'>
              Discover sustainability-first hotels, compare trusted credentials, and make better travel
              decisions backed by transparent certification evidence.
            </p>

            <div className='mt-5 grid gap-3 sm:grid-cols-3'>
              <article className='rounded-2xl border border-[#d6dff0] bg-white/90 p-4'>
                <p className='text-xs uppercase tracking-[0.12em] text-[#7f8da7]'>Certified listings</p>
                <p className='mt-1 text-2xl font-semibold text-[#213253]'>{totalHotels || '--'}</p>
              </article>
              <article className='rounded-2xl border border-[#d6dff0] bg-white/90 p-4'>
                <p className='text-xs uppercase tracking-[0.12em] text-[#7f8da7]'>AI top picks</p>
                <p className='mt-1 text-2xl font-semibold text-[#213253]'>{topHotels.length || '--'}</p>
              </article>
              <article className='rounded-2xl border border-[#d6dff0] bg-white/90 p-4'>
                <p className='text-xs uppercase tracking-[0.12em] text-[#7f8da7]'>Coverage</p>
                <p className='mt-1 text-2xl font-semibold text-[#213253]'>Global</p>
              </article>
            </div>
          </div>
        </section>

        <section className='w-full px-4 pb-8 sm:px-6 lg:px-8'>
          <section className='mb-4 rounded-3xl border border-white/70 bg-white/88 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2ff] text-[#5b6add]'>
                <Globe2 size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#1b2944]'>Curated Ethical Escapes</h3>
                <p className='mt-1 text-sm text-[#65748d]'>
                  Handpicked destinations that represent the quality and trust goals of your discovery
                  experience.
                </p>
              </div>
            </div>

            <div className='mt-4 grid gap-3 md:grid-cols-3'>
              {DISCOVERY_IMAGES.map((image) => (
                <article
                  key={image.url}
                  className='group overflow-hidden rounded-2xl border border-[#d6dff0] bg-[#f9fbff]'
                >
                  <div className='relative h-48 overflow-hidden'>
                    <img
                      src={image.url}
                      alt={image.title}
                      className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]'
                      loading='lazy'
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-[#111c33]/55 via-transparent to-transparent' />
                  </div>
                  <div className='p-4'>
                    <h4 className='text-base font-semibold text-[#1d2b49]'>{image.title}</h4>
                    <p className='mt-1 text-sm text-[#63738e]'>{image.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className='grid gap-4 lg:grid-cols-3'>
            <article className='glass-panel rounded-3xl border border-white/70 bg-white/88 p-5'>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2ff] text-[#5b6add]'>
                <ShieldCheck size={18} />
              </div>
              <h2 className='mt-3 text-lg font-semibold text-[#1b2944]'>Verified Sustainability</h2>
              <p className='mt-2 text-sm leading-6 text-[#63738e]'>
                Every listed property goes through a structured review process to ensure ethical and
                environmentally responsible operations.
              </p>
            </article>

            <article className='glass-panel rounded-3xl border border-white/70 bg-white/88 p-5'>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f8f2] text-[#278169]'>
                <Globe2 size={18} />
              </div>
              <h2 className='mt-3 text-lg font-semibold text-[#1b2944]'>Community Impact</h2>
              <p className='mt-2 text-sm leading-6 text-[#63738e]'>
                Certification standards include labor fairness, local sourcing, and community contribution to
                support inclusive tourism growth.
              </p>
            </article>

            <article className='glass-panel rounded-3xl border border-white/70 bg-white/88 p-5'>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4e9] text-[#b66a2a]'>
                <Compass size={18} />
              </div>
              <h2 className='mt-3 text-lg font-semibold text-[#1b2944]'>Smart Trip Planning</h2>
              <p className='mt-2 text-sm leading-6 text-[#63738e]'>
                Combine verified certifications with location and feedback insights to shortlist hotels that match
                your travel values.
              </p>
            </article>
          </div>

          <section className='mt-4 rounded-3xl border border-white/70 bg-white/88 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2ff] text-[#5b6add]'>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#1b2944]'>Recommended Right Now</h3>
                <p className='mt-1 text-sm text-[#65748d]'>
                  Top properties currently favored by trust indicators and traveler sentiment.
                </p>
              </div>
            </div>

            <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
              {topHotels.length ? (
                topHotels.slice(0, 6).map((hotel) => (
                  <article key={hotel.hotelId} className='rounded-2xl border border-[#d6dff0] bg-[#f9fbff] p-4'>
                    <p className='text-xs uppercase tracking-widest text-[#7f8da7]'>Hotel #{hotel.hotelId}</p>
                    <h4 className='mt-1 text-base font-semibold text-[#1d2b49]'>{hotel.hotelName || 'Unnamed hotel'}</h4>
                    <p className='mt-1 text-sm text-[#63738e]'>Trust score: {Number(hotel.trustScore || 0).toFixed(1)}</p>
                  </article>
                ))
              ) : (
                <p className='text-sm text-[#63738e]'>Loading recommendations...</p>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

export default DiscoveryPage
