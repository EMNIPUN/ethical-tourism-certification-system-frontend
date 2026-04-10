import { ArrowRight, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AsyncState from '../components/AsyncState'
import {
  selectHotelApplications,
  selectHotelApplicationsError,
  selectHotelApplicationsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotels } from '../store/certificateApplicationSlice'

function HotelCard({ hotel }) {
  const name = hotel?.businessInfo?.name || 'Untitled hotel'
  const type = hotel?.businessInfo?.businessType || '—'
  const status = hotel?.scoring?.certificationLevel || 'None'
  const googleScore = hotel?.scoring?.googleReviewScore

  return (
    <Link
      to={`/certificate-application/${hotel?._id}`}
      className='group rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)] transition hover:border-[var(--brand-700)]'
    >
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-lg font-bold text-[var(--text-950)]'>{name}</h3>
          <p className='mt-1 text-sm font-medium text-[var(--text-700)]'>{type}</p>
        </div>
        <span className='badge-chip'>{status}</span>
      </div>

      <div className='mt-5 flex flex-wrap items-center gap-3'>
        <div className='rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2'>
          <p className='text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-500)]'>Google score</p>
          <p className='mt-1 text-sm font-semibold text-[var(--text-950)]'>
            {typeof googleScore === 'number' ? googleScore : '—'}
          </p>
        </div>
        <div className='ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-900)] transition group-hover:text-[var(--brand-700)]'>
          View details <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  )
}

function HotelApplicationsListPage() {
  const dispatch = useDispatch()
  const hotels = useSelector(selectHotelApplications)
  const status = useSelector(selectHotelApplicationsStatus)
  const error = useSelector(selectHotelApplicationsError)

  useEffect(() => {
    dispatch(fetchHotels({ page: 1, limit: 50, sort: '-createdAt' }))
  }, [dispatch])

  return (
    <main className='min-h-screen bg-[var(--surface-canvas)] py-10'>
      <div className='ui-shell'>
        <header className='flex flex-col gap-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-8 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-900)]'>Certificate applications</p>
            <h1 className='mt-2 text-3xl font-bold tracking-tight text-[var(--text-950)]'>Your hotel applications</h1>
            <p className='mt-2 text-sm font-medium text-[var(--text-700)]'>Create new applications, confirm Google profile matches, and track scoring progress.</p>
          </div>

          <Link
            to='/certificate-application/new'
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-700)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105'
          >
            <Plus size={16} />
            New application
          </Link>
        </header>

        <div className='mt-8'>
          <AsyncState status={status} error={error} loadingMessage='Loading applications...'>
            {hotels?.length ? (
              <div className='grid gap-5 md:grid-cols-2'>
                {hotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-10 text-center shadow-[var(--shadow-soft)]'>
                <p className='text-lg font-bold text-[var(--text-950)]'>No applications yet</p>
                <p className='mt-2 text-sm font-medium text-[var(--text-700)]'>Start by creating a hotel application and uploading supporting documents.</p>
                <Link
                  to='/certificate-application/new'
                  className='mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-700)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105'
                >
                  <Plus size={16} />
                  Create your first application
                </Link>
              </div>
            )}
          </AsyncState>
        </div>
      </div>
    </main>
  )
}

export default HotelApplicationsListPage
