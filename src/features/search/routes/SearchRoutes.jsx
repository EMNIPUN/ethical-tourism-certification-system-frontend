import { Route, Routes } from 'react-router-dom'
import HotelSearch from '../pages/HotelSearch'
import HotelDetails from '../pages/HotelDetails'
import AllHotelsPage from '../pages/AllHotelsPage'
import DiscoveryPage from '../pages/DiscoveryPage'

function SearchRoutes() {
	return (
		<Routes>
			<Route index element={<HotelSearch />} />
			<Route path='hotels' element={<AllHotelsPage />} />
			<Route path='discovery' element={<DiscoveryPage />} />
			<Route path='hoteldetails/:hotelId' element={<HotelDetails />} />
		</Routes>
	)
}

export default SearchRoutes
