import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import SearchNavbar from '../components/SearchNavbar'
import SearchHero from '../components/SearchHero'
import HotelListSection from '../components/HotelListSection'
import {
  clearSelectedHotel,
  loadHotelContacts,
  loadHotelRecommendations,
  searchHotels,
  setSearchActiveTab,
  setSearchQuery,
  setSelectedHotelId,
} from '../store/searchSlice'
import {
  selectSearchActiveTab,
  selectSearchContacts,
  selectSearchContactsError,
  selectSearchContactsStatus,
  selectSearchQuery,
  selectSearchRecommendations,
  selectSearchRecommendationsError,
  selectSearchRecommendationsStatus,
  selectSearchSelectedHotelId,
} from '../store/searchSelectors'

function formatLocation(contact) {
  return contact?.businessInfo?.contact?.address || 'Address unavailable'
}

function formatEmail(contact) {
  return contact?.businessInfo?.contact?.email || 'Email unavailable'
}

function formatCertificateLevel(level) {
  return String(level || 'UNRANKED').replace(/_/g, ' ')
}

function formatScore(value) {
  const numericValue = Number(value || 0)
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1)
}

function HotelSearch() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const query = useAppSelector(selectSearchQuery)
  const activeTab = useAppSelector(selectSearchActiveTab)
  const contacts = useAppSelector(selectSearchContacts)
  const contactsStatus = useAppSelector(selectSearchContactsStatus)
  const contactsError = useAppSelector(selectSearchContactsError)
  const selectedHotelId = useAppSelector(selectSearchSelectedHotelId)
  const recommendations = useAppSelector(selectSearchRecommendations)
  const recommendationsStatus = useAppSelector(selectSearchRecommendationsStatus)
  const recommendationsError = useAppSelector(selectSearchRecommendationsError)
  const isRecommendationsLoading = recommendationsStatus === 'loading'
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    dispatch(loadHotelContacts())
    dispatch(loadHotelRecommendations())
  }, [dispatch])

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    if (selectedHotelId || !contacts.length) {
      return
    }

    dispatch(setSelectedHotelId(contacts[0].hotelId))
  }, [contacts, dispatch, selectedHotelId])

  const visibleHotels = activeTab === 'recommendations' ? recommendations?.topHotels || [] : contacts
  const loadingState = activeTab === 'recommendations' ? recommendationsStatus === 'loading' : contactsStatus === 'loading'
  const activeError = activeTab === 'recommendations' ? recommendationsError : contactsError

  function runSearch(event) {
    event.preventDefault()

    const trimmedQuery = searchInput.trim()
    dispatch(setSearchQuery(trimmedQuery))
    dispatch(setSearchActiveTab('discover'))
    dispatch(clearSelectedHotel())

    if (!trimmedQuery) {
      dispatch(loadHotelContacts())
      return
    }

    dispatch(searchHotels(trimmedQuery))
  }

  function handleShowAll() {
    setSearchInput('')
    dispatch(setSearchQuery(''))
    dispatch(setSearchActiveTab('discover'))
    dispatch(clearSelectedHotel())
    dispatch(loadHotelContacts())
  }

  function handleSelectHotel(hotelId, sourceTab) {
    dispatch(setSelectedHotelId(hotelId))
    dispatch(setSearchActiveTab(sourceTab))
    navigate(`/search/hoteldetails/${encodeURIComponent(String(hotelId))}`)
  }

  return (
    <main className='min-h-screen w-full overflow-x-hidden px-0 py-0'>
      <div className='flex min-h-screen w-full flex-col gap-5'>
        <SearchNavbar user={user} />

        <SearchHero
          user={user}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={runSearch}
          onShowAll={handleShowAll}
          onRefreshRecommendations={() => {
            if (isRecommendationsLoading) {
              return
            }

            dispatch(setSearchActiveTab('recommendations'))
            dispatch(loadHotelRecommendations())
          }}
          isRefreshingRecommendations={isRecommendationsLoading}
        />

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className='glass-panel w-full rounded-none border-x-0 border-white/70 bg-white/85 px-4 py-4 shadow-[0_18px_45px_-36px_rgba(18,29,48,0.45)] sm:px-6 sm:py-5 lg:px-8'
        >
          <div className='mt-5'>
            <HotelListSection
              activeTab={activeTab}
              onSwitchTab={(tab) => dispatch(setSearchActiveTab(tab))}
              activeError={activeError}
              loadingState={loadingState}
              visibleHotels={visibleHotels}
              recommendations={recommendations}
              recommendationsStatus={recommendationsStatus}
              contactsStatus={contactsStatus}
              selectedHotelId={selectedHotelId}
              onSelectHotel={handleSelectHotel}
              formatCertificateLevel={formatCertificateLevel}
              formatLocation={formatLocation}
              formatScore={formatScore}
              formatEmail={formatEmail}
            />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className='w-full px-4 pb-6 sm:px-6 lg:px-8'
        >
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.68fr)]'>
          <article className='glass-panel rounded-3xl border border-white/70 bg-white/80 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2ff] text-(--brand-700)'>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#17253f]'>Search workflow</h3>
                <p className='mt-1 text-sm leading-6 text-[#65748d]'>
                  The dashboard uses Redux for query state, API loading, selected hotel details, feedback summaries,
                  and AI ranking results. That keeps the page predictable even when you switch between discovery and
                  recommendation views.
                </p>
              </div>
            </div>
          </article>

          <article className='glass-panel rounded-3xl border border-white/70 bg-white/80 p-5'>
            <div className='flex items-start gap-3'>
              <div className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2ff] text-(--brand-700)'>
                <Zap size={18} />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-[#17253f]'>Backend endpoints used</h3>
                <p className='mt-1 text-sm leading-6 text-[#65748d]'>
                  Contacts, location search, hotel feedback, and AI recommendations all map directly to the search
                  module routes mounted under the API v1 prefix.
                </p>
              </div>
            </div>
          </article>
          </div>
        </motion.section>
      </div>
    </main>
  )
}

export default HotelSearch

