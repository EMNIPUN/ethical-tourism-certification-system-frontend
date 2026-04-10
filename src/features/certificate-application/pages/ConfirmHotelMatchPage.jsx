import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import GoogleCandidatePicker from '../components/GoogleCandidatePicker'
import {
    selectConfirmError,
    selectConfirmResult,
    selectConfirmStatus,
    selectCreateResult,
    selectHotelDetails,
    selectHotelDetailsStatus,
} from '../store/certificateApplicationSelectors'
import { fetchHotel, submitConfirmMatch } from '../store/certificateApplicationSlice'

function ConfirmHotelMatchPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const createResult = useSelector(selectCreateResult)
    const confirmStatus = useSelector(selectConfirmStatus)
    const confirmError = useSelector(selectConfirmError)
    const confirmResult = useSelector(selectConfirmResult)

    const hotel = useSelector(selectHotelDetails)
    const hotelStatus = useSelector(selectHotelDetailsStatus)

    const candidates = useMemo(() => {
        if (createResult?.hotelId === id) {
            return createResult?.candidates || []
        }

        return []
    }, [createResult, id])

    const [placeId, setPlaceId] = useState('')

    useEffect(() => {
        dispatch(fetchHotel(id))
    }, [dispatch, id])

    async function handleConfirm() {
        const resolvedPlaceId = placeId?.trim() ? placeId.trim() : null
        const action = await dispatch(submitConfirmMatch({ hotelId: id, placeId: resolvedPlaceId }))

        if (submitConfirmMatch.fulfilled.match(action)) {
            navigate(`/certificate-application/${id}`, { replace: true })
        }
    }

    return (
        <main className='min-h-screen bg-[var(--surface-canvas)] py-10'>
            <div className='ui-shell'>
                <div className='mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
                    <div>
                        <p className='text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--brand-900)]'>Step 2</p>
                        <h1 className='mt-2 text-2xl font-bold tracking-tight text-[var(--text-950)]'>Confirm Google profile match</h1>
                        <p className='mt-2 text-sm font-medium text-[var(--text-700)]'>Choose the correct listing so the system can evaluate reviews accurately.</p>
                    </div>

                    <Link
                        to={`/certificate-application/${id}`}
                        className='inline-flex items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-white)] px-4 py-3 text-sm font-semibold text-[var(--text-700)] transition hover:border-[var(--brand-700)] hover:text-[var(--brand-900)]'
                    >
                        <ArrowLeft size={16} /> Back to details
                    </Link>
                </div>

                {confirmError ? (
                    <div className='mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--error-100)] px-6 py-4 shadow-[var(--shadow-soft)]'>
                        <p className='text-sm font-semibold text-[var(--error-600)]'>{confirmError}</p>
                    </div>
                ) : null}

                <AsyncState status={hotelStatus} loadingMessage='Loading hotel details...'>
                    <div className='mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
                        <p className='text-sm font-bold text-[var(--text-950)]'>{hotel?.businessInfo?.name || 'Hotel'}</p>
                        <p className='mt-1 text-sm font-medium text-[var(--text-700)]'>{hotel?.businessInfo?.contact?.address || '—'}</p>
                    </div>
                </AsyncState>

                <GoogleCandidatePicker candidates={candidates} selectedPlaceId={placeId} onChange={setPlaceId} allowManualEntry />

                {confirmResult?.evaluation ? (
                    <div className='mt-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
                        <h2 className='text-lg font-bold text-[var(--text-950)]'>Latest evaluation</h2>
                        <p className='mt-2 text-sm font-medium text-[var(--text-700)]'>{confirmResult.message}</p>
                        <div className='mt-4 grid gap-3 md:grid-cols-3'>
                            <div className='rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3'>
                                <p className='text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-500)]'>Status</p>
                                <p className='mt-1 text-sm font-semibold text-[var(--text-950)]'>{confirmResult.evaluation.status}</p>
                            </div>
                            <div className='rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3'>
                                <p className='text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-500)]'>AI score</p>
                                <p className='mt-1 text-sm font-semibold text-[var(--text-950)]'>{confirmResult.evaluation.aiScore}</p>
                            </div>
                            <div className='rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3'>
                                <p className='text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-500)]'>Notes</p>
                                <p className='mt-1 text-sm font-semibold text-[var(--text-950)]'>
                                    {confirmResult.evaluation.aiJustification || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className='mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-end'>
                    <button
                        type='button'
                        onClick={handleConfirm}
                        disabled={confirmStatus === 'loading'}
                        className='inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-700)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {confirmStatus === 'loading' ? 'Confirming...' : 'Confirm match & evaluate'}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </main>
    )
}

export default ConfirmHotelMatchPage
