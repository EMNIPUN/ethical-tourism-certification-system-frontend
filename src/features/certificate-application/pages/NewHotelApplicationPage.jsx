import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import HotelApplicationWizard from '../components/HotelApplicationWizard'
import {
  selectCertificateApplicationDraft,
  selectCertificateApplicationStep,
  selectCreateError,
  selectCreateStatus,
} from '../store/certificateApplicationSelectors'
import {
  setApplicationDraft,
  setApplicationStep,
  submitNewHotel,
  updateApplicationDraftField,
} from '../store/certificateApplicationSlice'

const EMPTY_DRAFT = {
  businessInfo: {
    contact: {},
  },
  guestServices: {
    facilities: {},
  },
}

function NewHotelApplicationPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const draft = useSelector(selectCertificateApplicationDraft)
  const step = useSelector(selectCertificateApplicationStep)
  const createStatus = useSelector(selectCreateStatus)
  const createError = useSelector(selectCreateError)

  useEffect(() => {
    dispatch(setApplicationStep(1))
    if (!draft || !Object.keys(draft).length) {
      dispatch(setApplicationDraft(EMPTY_DRAFT))
    }
  }, [dispatch])

  async function handleSubmit({ draft: payloadDraft, files }) {
    const action = await dispatch(submitNewHotel({ hotelData: payloadDraft, files }))

    if (submitNewHotel.fulfilled.match(action)) {
      const hotelId = action.payload.hotelId
      navigate(`/certificate-application/${hotelId}/confirm-match`, { replace: true })
    }
  }

  return (
    <main className='min-h-screen bg-[var(--surface-canvas)] py-10'>
      <div className='ui-shell'>
        {createError ? (
          <div className='mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--error-100)] px-6 py-4 shadow-[var(--shadow-soft)]'>
            <p className='text-sm font-semibold text-[var(--error-600)]'>{createError}</p>
          </div>
        ) : null}

        <HotelApplicationWizard
          draft={draft}
          step={step}
          onChangeDraft={(path, value) => dispatch(updateApplicationDraftField({ path, value }))}
          onStepChange={(nextStep) => dispatch(setApplicationStep(nextStep))}
          onSubmit={handleSubmit}
          submitting={createStatus === 'loading'}
          header='Create a new application'
          subheader='Submit your hotel details and supporting evidence. You will then confirm the correct Google Business profile match for scoring.'
        />
      </div>
    </main>
  )
}

export default NewHotelApplicationPage
