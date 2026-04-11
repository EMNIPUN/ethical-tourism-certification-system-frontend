import { Route, Routes } from 'react-router-dom'
import CertificateApplicationLayout from '../components/CertificateApplicationLayout'
import HotelApplicationsListPage from '../pages/HotelApplicationsListPage'
import NewHotelApplicationPage from '../pages/NewHotelApplicationPage'
import HotelApplicationDetailsPage from '../pages/HotelApplicationDetailsPage'
import ConfirmHotelMatchPage from '../pages/ConfirmHotelMatchPage'
import EditHotelApplicationPage from '../pages/EditHotelApplicationPage'
import ProfilePage from '../pages/ProfilePage'

function CertificateApplicationRoutes() {
	return (
		<Routes>
			<Route element={<CertificateApplicationLayout />}>
				<Route index element={<HotelApplicationsListPage />} />
				<Route path='profile' element={<ProfilePage />} />
				<Route path='new' element={<NewHotelApplicationPage />} />
				<Route path=':id' element={<HotelApplicationDetailsPage />} />
				<Route path=':id/confirm-match' element={<ConfirmHotelMatchPage />} />
				<Route path=':id/edit' element={<EditHotelApplicationPage />} />
			</Route>
		</Routes>
	)
}

export default CertificateApplicationRoutes
