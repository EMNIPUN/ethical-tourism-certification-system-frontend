import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import {
  clearCertificateManagementMessages,
  fetchEligibleHotels,
  issueCertificateAction,
} from '../store/certificateManagementSlice'
import {
  selectCertificateManagementActionError,
  selectCertificateManagementActionStatus,
  selectCertificateManagementActionSuccess,
  selectCertificateManagementError,
  selectEligibleHotels,
  selectEligibleHotelsStatus,
} from '../store/certificateManagementSelectors'

function IssueCertificatePage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const preselectedHotel = searchParams.get('hotelId') || ''

  const eligibleHotels = useAppSelector(selectEligibleHotels)
  const hotelsStatus = useAppSelector(selectEligibleHotelsStatus)
  const errorMessage = useAppSelector(selectCertificateManagementError)
  const actionError = useAppSelector(selectCertificateManagementActionError)
  const actionSuccess = useAppSelector(selectCertificateManagementActionSuccess)
  const actionStatus = useAppSelector(selectCertificateManagementActionStatus)
  const isLoading = hotelsStatus === 'loading'
  const isSubmitting = actionStatus === 'loading'

  const [formData, setFormData] = useState({
    hotelId: preselectedHotel,
    validityPeriodInMonths: 12,
  })
  const [createdCertificateNumber, setCreatedCertificateNumber] = useState('')

  useEffect(() => {
    if (hotelsStatus === 'idle') {
      dispatch(fetchEligibleHotels())
    }

    return () => {
      dispatch(clearCertificateManagementMessages())
    }
  }, [dispatch, hotelsStatus])

  const selectableHotels = useMemo(
    () => eligibleHotels.filter((item) => !item.alreadyCertified),
    [eligibleHotels],
  )

  const selectedHotel = useMemo(
    () => selectableHotels.find((item) => item.hotelId === formData.hotelId),
    [selectableHotels, formData.hotelId],
  )

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: name === 'validityPeriodInMonths' ? Number(value) : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    dispatch(clearCertificateManagementMessages())
    setCreatedCertificateNumber('')

    if (!formData.hotelId || !formData.validityPeriodInMonths) {
      return
    }

    try {
      const response = await dispatch(issueCertificateAction(formData)).unwrap()
      const certificateNumber = response?.data?.certificateNumber
      setCreatedCertificateNumber(certificateNumber || '')
      dispatch(fetchEligibleHotels())
    } catch {
      // Error state is handled in Redux actionError.
    }
  }

  return (
    <section className='grid gap-5 xl:grid-cols-3'>
      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2'>
        <h2 className='text-xl font-bold text-slate-900'>Issue Certificate</h2>
        <p className='mt-1 text-sm text-slate-600'>Issue a new ACTIVE certificate for an eligible hotel.</p>

        {errorMessage || actionError ? (
          <p className='mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>
            {actionError || errorMessage}
          </p>
        ) : null}

        {actionSuccess ? (
          <div className='mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'>
            <p>{actionSuccess}</p>
            {createdCertificateNumber ? (
              <Link
                to={`../certificates/${encodeURIComponent(createdCertificateNumber)}`}
                className='mt-2 inline-flex font-semibold text-emerald-800 underline'
              >
                View {createdCertificateNumber}
              </Link>
            ) : null}
          </div>
        ) : null}

        <form className='mt-5 space-y-4' onSubmit={handleSubmit}>
          <label className='block text-sm font-medium text-slate-700' htmlFor='hotelId'>
            Eligible hotel
            <select
              id='hotelId'
              name='hotelId'
              value={formData.hotelId}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'
              disabled={isLoading}
            >
              <option value=''>Select hotel</option>
              {selectableHotels.map((item) => (
                <option key={item.hotelId} value={item.hotelId}>
                  {item.hotel?.businessInfo?.name || item.hotelId}
                </option>
              ))}
            </select>
          </label>

          <label className='block text-sm font-medium text-slate-700' htmlFor='validityPeriodInMonths'>
            Validity period (months)
            <input
              id='validityPeriodInMonths'
              name='validityPeriodInMonths'
              type='number'
              min='1'
              max='120'
              value={formData.validityPeriodInMonths}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm'
            />
          </label>

          <button
            type='submit'
            disabled={isLoading || isSubmitting || !formData.hotelId}
            className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Issuing...' : 'Issue certificate'}
          </button>
        </form>
      </article>

      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h3 className='text-lg font-bold text-slate-900'>Selected Hotel Preview</h3>

        {isLoading ? (
          <p className='mt-4 text-sm text-slate-500'>Loading eligible hotels...</p>
        ) : selectedHotel ? (
          <div className='mt-4 space-y-2 text-sm text-slate-700'>
            <p><span className='font-semibold'>Name:</span> {selectedHotel.hotel?.businessInfo?.name || 'N/A'}</p>
            <p><span className='font-semibold'>Email:</span> {selectedHotel.hotel?.businessInfo?.contact?.email || 'N/A'}</p>
            <p><span className='font-semibold'>Phone:</span> {selectedHotel.hotel?.businessInfo?.contact?.phone || 'N/A'}</p>
            <p><span className='font-semibold'>Address:</span> {selectedHotel.hotel?.businessInfo?.contact?.address || 'N/A'}</p>
          </div>
        ) : (
          <p className='mt-4 text-sm text-slate-500'>Select a hotel to preview details.</p>
        )}
      </article>
    </section>
  )
}

export default IssueCertificatePage
