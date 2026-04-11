import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { fetchEligibleHotels } from '../store/certificateManagementSlice'
import {
  selectCertificateManagementError,
  selectEligibleHotels,
  selectEligibleHotelsStatus,
} from '../store/certificateManagementSelectors'

function EligibleHotelsPage() {
  const dispatch = useAppDispatch()
  const [search, setSearch] = useState('')
  const hotels = useAppSelector(selectEligibleHotels)
  const hotelsStatus = useAppSelector(selectEligibleHotelsStatus)
  const errorMessage = useAppSelector(selectCertificateManagementError)
  const isLoading = hotelsStatus === 'loading'

  useEffect(() => {
    if (hotelsStatus === 'idle') {
      dispatch(fetchEligibleHotels())
    }
  }, [dispatch, hotelsStatus])

  const filteredHotels = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return hotels
    }

    return hotels.filter((item) => {
      const name = item.hotel?.businessInfo?.name || ''
      const email = item.hotel?.businessInfo?.contact?.email || ''
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    })
  }, [hotels, search])

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl font-bold text-slate-900'>Eligible Hotels</h2>
          <p className='mt-1 text-sm text-slate-600'>Hotels with passed hotel and audit score are listed here.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search by hotel or email'
          className='w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm'
        />
      </div>

      {errorMessage ? (
        <p className='mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <p className='mt-4 rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading eligible hotels...</p>
      ) : (
        <div className='mt-4 overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 text-left text-xs uppercase text-slate-500'>
                <th className='px-3 py-2'>Hotel</th>
                <th className='px-3 py-2'>Email</th>
                <th className='px-3 py-2'>Already Certified</th>
                <th className='px-3 py-2'>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((item) => (
                <tr key={item.hotelRequestId || item.hotelId} className='border-b border-slate-100'>
                  <td className='px-3 py-2 font-semibold text-slate-900'>{item.hotel?.businessInfo?.name || item.hotelId}</td>
                  <td className='px-3 py-2 text-slate-700'>{item.hotel?.businessInfo?.contact?.email || 'N/A'}</td>
                  <td className='px-3 py-2'>
                    {item.alreadyCertified ? (
                      <span className='rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700'>Yes</span>
                    ) : (
                      <span className='rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700'>No</span>
                    )}
                  </td>
                  <td className='px-3 py-2'>
                    {item.alreadyCertified ? (
                      <span className='text-xs text-slate-500'>Already active</span>
                    ) : (
                      <Link
                        to={`../issue?hotelId=${encodeURIComponent(item.hotelId)}`}
                        className='rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700'
                      >
                        Issue now
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredHotels.length ? (
            <p className='px-3 py-4 text-sm text-slate-500'>No eligible hotels match your search.</p>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default EligibleHotelsPage
