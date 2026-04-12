import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, MapPin, Mail, BadgeCheck } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import SearchNavbar from '../components/SearchNavbar'
import { loadHotelContacts, setSelectedHotelId } from '../store/searchSlice'
import {
  selectSearchContacts,
  selectSearchContactsError,
  selectSearchContactsStatus,
} from '../store/searchSelectors'

function getHotelName(contact) {
  return contact?.businessInfo?.name || contact?.hotelName || 'Unnamed hotel'
}

function getHotelLocation(contact) {
  return contact?.businessInfo?.contact?.address || 'Location unavailable'
}

function getHotelEmail(contact) {
  return contact?.businessInfo?.contact?.email || 'Email unavailable'
}

function getCertificateLevel(contact) {
  return String(contact?.certificate?.level || 'UNRANKED').replace(/_/g, ' ')
}

function AllHotelsPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const contacts = useAppSelector(selectSearchContacts)
  const contactsStatus = useAppSelector(selectSearchContactsStatus)
  const contactsError = useAppSelector(selectSearchContactsError)

  useEffect(() => {
    if (contactsStatus === 'idle') {
      dispatch(loadHotelContacts())
    }
  }, [contactsStatus, dispatch])

  const sortedHotels = useMemo(() => {
    return [...contacts].sort((left, right) => getHotelName(left).localeCompare(getHotelName(right)))
  }, [contacts])

  function openHotelDetails(hotelId) {
    dispatch(setSelectedHotelId(hotelId))
    navigate(`/search/hoteldetails/${encodeURIComponent(String(hotelId))}`)
  }

  return (
    <main className='min-h-screen w-full overflow-x-hidden'>
      <div className='flex min-h-screen w-full flex-col gap-5'>
        <SearchNavbar user={user} />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className='w-full px-4 pt-4 sm:px-6 lg:px-8'
        >
          <div className='glass-panel rounded-3xl border border-white/70 bg-white/84 p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.15em] text-[#7b88a0]'>Directory</p>
            <h1 className='mt-2 text-3xl font-semibold text-[#17253f] sm:text-4xl'>All Certified Hotels</h1>
            <p className='mt-2 max-w-3xl text-sm text-[#65748d] sm:text-base'>
              Browse the complete list of certified properties and open a detailed profile to view compliance,
              trust indicators, and traveler feedback.
            </p>
          </div>
        </motion.section>

        <section className='w-full px-4 pb-8 sm:px-6 lg:px-8'>
          {contactsStatus === 'loading' ? (
            <div className='glass-panel rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-[#667791]'>
              Loading hotels...
            </div>
          ) : null}

          {contactsStatus === 'failed' ? (
            <div className='glass-panel rounded-3xl border border-[#efc8c8] bg-[#fff5f5] p-6 text-sm text-[#8c3c3c]'>
              {contactsError || 'Failed to load hotels.'}
            </div>
          ) : null}

          {contactsStatus === 'succeeded' ? (
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {sortedHotels.map((hotel) => (
                <motion.article
                  key={hotel.hotelId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  whileHover={{ y: -2 }}
                  className='glass-panel rounded-3xl border border-white/70 bg-white/88 p-5 shadow-[0_16px_40px_-34px_rgba(27,40,80,0.4)]'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h2 className='text-lg font-semibold text-[#1b2944]'>{getHotelName(hotel)}</h2>
                      <p className='mt-1 text-xs font-semibold uppercase tracking-widest text-[#7a89a4]'>
                        Hotel #{hotel.hotelId}
                      </p>
                    </div>
                    <span className='inline-flex items-center gap-1 rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-[#4858c3]'>
                      <BadgeCheck size={14} />
                      {getCertificateLevel(hotel)}
                    </span>
                  </div>

                  <div className='mt-4 space-y-2 text-sm text-[#60708a]'>
                    <p className='inline-flex items-start gap-2'>
                      <MapPin size={14} className='mt-0.5 shrink-0' />
                      <span>{getHotelLocation(hotel)}</span>
                    </p>
                    <p className='inline-flex items-start gap-2'>
                      <Mail size={14} className='mt-0.5 shrink-0' />
                      <span>{getHotelEmail(hotel)}</span>
                    </p>
                  </div>

                  <button
                    type='button'
                    onClick={() => openHotelDetails(hotel.hotelId)}
                    className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ccd6ea] bg-white px-4 py-2.5 text-sm font-semibold text-[#4a5a77] transition hover:bg-[#f4f7fd]'
                  >
                    <Building2 size={15} />
                    View Details
                  </button>
                </motion.article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default AllHotelsPage
