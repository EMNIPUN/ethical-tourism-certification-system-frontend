export const selectCertificateApplicationState = (state) => state.certificateApplication
export const selectCertificateApplicationStep  = (state) => state.certificateApplication.currentStep
export const selectCertificateApplicationDraft = (state) => state.certificateApplication.draft

export const selectHotelApplications      = (state) => state.certificateApplication.hotels.items
export const selectHotelApplicationsStatus = (state) => state.certificateApplication.hotels.status
export const selectHotelApplicationsError  = (state) => state.certificateApplication.hotels.error
export const selectHotelApplicationsCount  = (state) => state.certificateApplication.hotels.count
export const selectHotelListQuery          = (state) => state.certificateApplication.hotels.query

export const selectHotelDetails = (state) => state.certificateApplication.hotelDetails.data
export const selectHotelDetailsStatus = (state) => state.certificateApplication.hotelDetails.status
export const selectHotelDetailsError = (state) => state.certificateApplication.hotelDetails.error

export const selectCreateResult = (state) => state.certificateApplication.create.result
export const selectCreateStatus = (state) => state.certificateApplication.create.status
export const selectCreateError = (state) => state.certificateApplication.create.error

export const selectConfirmResult = (state) => state.certificateApplication.confirm.result
export const selectConfirmStatus = (state) => state.certificateApplication.confirm.status
export const selectConfirmError = (state) => state.certificateApplication.confirm.error

export const selectUpdateStatus = (state) => state.certificateApplication.update.status
export const selectUpdateError = (state) => state.certificateApplication.update.error

export const selectDeleteStatus = (state) => state.certificateApplication.delete.status
export const selectDeleteError = (state) => state.certificateApplication.delete.error

