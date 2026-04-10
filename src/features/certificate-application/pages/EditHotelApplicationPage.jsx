import { useCallback, useEffect } from 'react'
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
    const { id }      = useParams()
    const dispatch    = useDispatch()
    const navigate    = useNavigate()

    const hotel       = useSelector(selectHotelDetails)
    const hotelStatus = useSelector(selectHotelDetailsStatus)
    const hotelError  = useSelector(selectHotelDetailsError)

    const draft       = useSelector(selectCertificateApplicationDraft)
    const step        = useSelector(selectCertificateApplicationStep)

    const updateStatus = useSelector(selectUpdateStatus)
    const updateError  = useSelector(selectUpdateError)

    const loadHotel = useCallback(() => { dispatch(fetchHotel(id)) }, [dispatch, id])

    useEffect(() => {
        dispatch(setApplicationStep(1))
        loadHotel()
    }, [dispatch, loadHotel])

    useEffect(() => {
        if (hotel?._id === id) dispatch(setApplicationDraft(hotel))
    }, [dispatch, hotel, id])

    async function handleSubmit({ draft: payloadDraft, files }) {
        const action = await dispatch(submitHotelUpdate({ hotelId: id, hotelData: payloadDraft, files }))
        if (submitHotelUpdate.fulfilled.match(action)) {
            navigate(`/certificate-application/${id}`, { replace: true })
        }
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {updateError ? (
                <div className='ca-banner ca-banner--error ca-animate-up'>
                    <p className='ca-banner-text'>{updateError}</p>
                </div>
            ) : null}

            <AsyncState
                status={hotelStatus}
                error={hotelError}
                loadingMessage='Loading application…'
                onRetry={loadHotel}
                retryLabel='Reload'
            >
                <HotelApplicationWizard
                    draft={draft}
                    step={step}
                    onChangeDraft={(path, value) => dispatch(updateApplicationDraftField({ path, value }))}
                    onStepChange={(next) => dispatch(setApplicationStep(next))}
                    onSubmit={handleSubmit}
                    submitting={updateStatus === 'loading'}
                    submitLabel='Save changes'
                    header='Edit application'
                    subheader='Update hotel details and re-upload supporting files as needed. Changes are saved on submission.'
                />
            </AsyncState>
        </div>
    )
}

export default EditHotelApplicationPage
