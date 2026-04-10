import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import AsyncState from '../components/AsyncState'
import HotelApplicationWizard from '../components/HotelApplicationWizard'
import {
  selectCertificateApplicationDraft,
  selectCertificateApplicationStep,
  selectHotelDetails,
  selectHotelDetailsError,
  selectHotelDetailsStatus,
  selectUpdateError,
  selectUpdateStatus,
} from '../store/certificateApplicationSelectors'
import {
  fetchHotel,
  setApplicationDraft,
  setApplicationStep,
  submitHotelUpdate,
  updateApplicationDraftField,
} from '../store/certificateApplicationSlice'

function EditHotelApplicationPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const hotel = useSelector(selectHotelDetails)
  const hotelStatus = useSelector(selectHotelDetailsStatus)
  const hotelError = useSelector(selectHotelDetailsError)

  const draft = useSelector(selectCertificateApplicationDraft)
  const step = useSelector(selectCertificateApplicationStep)

  const updateStatus = useSelector(selectUpdateStatus)
  const updateError = useSelector(selectUpdateError)

  useEffect(() => {
    dispatch(setApplicationStep(1))
    dispatch(fetchHotel(id))
  }, [dispatch, id])

  useEffect(() => {
    if (hotel?._id === id) {
      dispatch(setApplicationDraft(hotel))
    }
  }, [dispatch, hotel, id])

  async function handleSubmit({ draft: payloadDraft, files }) {
    const action = await dispatch(submitHotelUpdate({ hotelId: id, hotelData: payloadDraft, files }))

    if (submitHotelUpdate.fulfilled.match(action)) {
      navigate(`/certificate-application/${id}`, { replace: true })
    }
  }

  return (
    <main className='min-h-screen bg-[var(--surface-canvas)] py-10'>
      <div className='ui-shell'>
        {updateError ? (
          <div className='mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--error-100)] px-6 py-4 shadow-[var(--shadow-soft)]'>
            <p className='text-sm font-semibold text-[var(--error-600)]'>{updateError}</p>
          </div>
        ) : null}

        <AsyncState status={hotelStatus} error={hotelError} loadingMessage='Loading application...'>
          <HotelApplicationWizard
            draft={draft}
            step={step}
            onChangeDraft={(path, value) => dispatch(updateApplicationDraftField({ path, value }))}
            onStepChange={(nextStep) => dispatch(setApplicationStep(nextStep))}
            onSubmit={handleSubmit}
            submitting={updateStatus === 'loading'}
            submitLabel='Save changes'
            header='Edit application'
            subheader='Update hotel details and re-upload any supporting files as needed.'
          />
        </AsyncState>
      </div>
    </main>
  )
}

export default EditHotelApplicationPage
