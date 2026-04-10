import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import {
    selectDeleteError,
    selectDeleteStatus,
    selectHotelDetails,
    selectHotelDetailsError,
    selectHotelDetailsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotel, submitHotelDelete } from '../store/certificateApplicationSlice'

function StatCard({ label, value }) {
    return (
        <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-5 shadow-(--shadow-soft)'>
            <p className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>{label}</p>
            <p className='mt-2 text-lg font-bold text-(--text-950)'>{value ?? '—'}</p>
        </div>
    )
}

function HotelApplicationDetailsPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hotel = useSelector(selectHotelDetails)
    const status = useSelector(selectHotelDetailsStatus)
    const error = useSelector(selectHotelDetailsError)

    const deleteStatus = useSelector(selectDeleteStatus)
    const deleteError = useSelector(selectDeleteError)

    const loadHotel = useCallback(() => {
        dispatch(fetchHotel(id))
    }, [dispatch, id])

    useEffect(() => {
        loadHotel()
    }, [loadHotel])

    async function handleDelete() {
        const confirmed = window.confirm('Delete this application? This cannot be undone.')
        if (!confirmed) return

        const action = await dispatch(submitHotelDelete({ hotelId: id }))
        if (submitHotelDelete.fulfilled.match(action)) {
            navigate('/certificate-application', { replace: true })
        }
    }

    const hasPlaceId = Boolean(hotel?.googleMapsData?.placeId)

    return (
        <main className='min-h-screen bg-(--surface-canvas) py-10'>
            <div className='ui-shell'>
                <header className='glass-panel flex flex-col gap-5 rounded-2xl p-7 md:flex-row md:items-start md:justify-between'>
                    <div>
                        <Link
                            to='/certificate-application'
                            className='inline-flex items-center gap-2 text-sm font-semibold text-(--brand-900) transition hover:text-(--brand-700)'
                        >
                            <ArrowLeft size={16} /> Back to applications
                        </Link>
                        <h1 className='mt-4 text-3xl font-bold tracking-tight text-(--text-950)'>
                            {hotel?.businessInfo?.name || 'Application details'}
                        </h1>
                        <p className='mt-2 text-sm font-medium text-(--text-700)'>
                            {hotel?.businessInfo?.contact?.address || '—'}
                        </p>
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row'>
                        <Link
                            to={`/certificate-application/${id}/edit`}
                            className='inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-soft) bg-(--surface-white) px-4 py-3 text-sm font-semibold text-(--text-700) transition hover:border-(--brand-700) hover:text-(--brand-900)'
                        >
                            <Pencil size={16} /> Edit
                        </Link>
                        <button
                            type='button'
                            onClick={handleDelete}
                            disabled={deleteStatus === 'loading'}
                            className='inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-soft) bg-(--surface-white) px-4 py-3 text-sm font-semibold text-(--error-600) transition hover:border-(--error-600) disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <Trash2 size={16} /> {deleteStatus === 'loading' ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </header>

                {deleteError ? (
                    <div className='mt-6 rounded-2xl border border-(--border-soft) bg-(--error-100) px-6 py-4 shadow-(--shadow-soft)'>
                        <p className='text-sm font-semibold text-(--error-600)'>{deleteError}</p>
                    </div>
                ) : null}

                <div className='mt-8'>
                    <AsyncState
                        status={status}
                        error={error}
                        loadingMessage='Loading application...'
                        onRetry={loadHotel}
                        retryLabel='Reload'
                    >
                        {hotel ? (
                            <div className='grid gap-6'>
                                <div className='grid gap-5 md:grid-cols-3'>
                                    <StatCard label='Certification level' value={hotel?.scoring?.certificationLevel} />
                                    <StatCard label='Google review score' value={hotel?.scoring?.googleReviewScore} />
                                    <StatCard label='Data completion' value={hotel?.scoring?.dataCompletionScore} />
                                </div>

                                <section className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                                    <h2 className='text-lg font-bold text-(--text-950)'>Workflow</h2>
                                    <p className='mt-2 text-sm font-medium text-(--text-700)'>
                                        {hasPlaceId
                                            ? 'Google profile match confirmed. You can review scores and continue the certification lifecycle in the management module.'
                                            : 'Google profile match not confirmed yet. Complete Step 2 to enable review-based scoring.'}
                                    </p>

                                    <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
                                        <Link
                                            to={`/certificate-application/${id}/confirm-match`}
                                            className='inline-flex items-center justify-center rounded-xl bg-(--brand-700) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105'
                                        >
                                            {hasPlaceId ? 'Re-confirm match' : 'Confirm match'}
                                        </Link>
                                        <Link
                                            to='/certificate-management'
                                            className='inline-flex items-center justify-center rounded-xl border border-(--border-soft) bg-(--surface-white) px-5 py-3 text-sm font-semibold text-(--text-700) transition hover:border-(--brand-700) hover:text-(--brand-900)'
                                        >
                                            Go to certificate management
                                        </Link>
                                    </div>
                                </section>

                                <section className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                                    <h2 className='text-lg font-bold text-(--text-950)'>Contact</h2>
                                    <div className='mt-4 grid gap-3 md:grid-cols-2'>
                                        <div className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>Owner</p>
                                            <p className='mt-1 text-sm font-semibold text-(--text-950)'>{hotel?.businessInfo?.contact?.ownerName || '—'}</p>
                                        </div>
                                        <div className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>Email</p>
                                            <p className='mt-1 text-sm font-semibold text-(--text-950)'>{hotel?.businessInfo?.contact?.email || '—'}</p>
                                        </div>
                                        <div className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>Phone</p>
                                            <p className='mt-1 text-sm font-semibold text-(--text-950)'>{hotel?.businessInfo?.contact?.phone || '—'}</p>
                                        </div>
                                        <div className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>Website</p>
                                            <p className='mt-1 text-sm font-semibold text-(--text-950)'>{hotel?.businessInfo?.contact?.website || '—'}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-10 text-center shadow-(--shadow-soft)'>
                                <p className='text-lg font-bold text-(--text-950)'>Application not found</p>
                                <p className='mt-2 text-sm font-medium text-(--text-700)'>Return to the applications list and try again.</p>
                                <Link
                                    to='/certificate-application'
                                    className='mt-6 inline-flex items-center justify-center rounded-xl bg-(--brand-700) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105'
                                >
                                    Back to list
                                </Link>
                            </div>
                        )}
                    </AsyncState>
                </div>
            </div>
        </main>
    )
}

export default HotelApplicationDetailsPage
