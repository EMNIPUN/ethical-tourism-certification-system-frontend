import { Route, Routes } from 'react-router-dom'
import HotelApplicationsListPage from '../pages/HotelApplicationsListPage'
import NewHotelApplicationPage from '../pages/NewHotelApplicationPage'
import HotelApplicationDetailsPage from '../pages/HotelApplicationDetailsPage'
import ConfirmHotelMatchPage from '../pages/ConfirmHotelMatchPage'
import EditHotelApplicationPage from '../pages/EditHotelApplicationPage'

function CertificateApplicationRoutes() {
	return (
		<Routes>
			<Route index element={<HotelApplicationsListPage />} />
			<Route path='new' element={<NewHotelApplicationPage />} />
			<Route path=':id' element={<HotelApplicationDetailsPage />} />
			<Route path=':id/confirm-match' element={<ConfirmHotelMatchPage />} />
			<Route path=':id/edit' element={<EditHotelApplicationPage />} />
		</Routes>
	)
}

export default CertificateApplicationRoutes
