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
    invalidateHotelsList,
    setApplicationDraft,
    setApplicationStep,
    submitNewHotel,
    updateApplicationDraftField,
} from '../store/certificateApplicationSlice'

const EMPTY_DRAFT = {
    businessInfo: { contact: {} },
    guestServices: { facilities: {} },
}

function NewHotelApplicationPage() {
    const dispatch     = useDispatch()
    const navigate     = useNavigate()

    const draft        = useSelector(selectCertificateApplicationDraft)
    const step         = useSelector(selectCertificateApplicationStep)
    const createStatus = useSelector(selectCreateStatus)
    const createError  = useSelector(selectCreateError)

    useEffect(() => {
        dispatch(setApplicationStep(1))
        if (!draft || !Object.keys(draft).length) {
            dispatch(setApplicationDraft(EMPTY_DRAFT))
        }
    }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSubmit({ draft: payloadDraft, files }) {
        const action = await dispatch(submitNewHotel({ hotelData: payloadDraft, files }))
        if (submitNewHotel.fulfilled.match(action)) {
            dispatch(invalidateHotelsList()) // force list to re-fetch on next visit
            navigate(`/certificate-application/${action.payload.hotelId}/confirm-match`, { replace: true })
        }
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {createError ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <p className='ca-banner-text'>{createError}</p>
                </div>
            ) : null}

            <HotelApplicationWizard
                draft={draft}
                step={step}
                onChangeDraft={(path, value) => dispatch(updateApplicationDraftField({ path, value }))}
                onStepChange={(next) => dispatch(setApplicationStep(next))}
                onSubmit={handleSubmit}
                submitting={createStatus === 'loading'}
                header='Create a new application'
                subheader='Submit your hotel details and supporting evidence. You will then confirm the correct Google Business profile for review-based scoring.'
            />
        </div>
    )
}

export default NewHotelApplicationPage
