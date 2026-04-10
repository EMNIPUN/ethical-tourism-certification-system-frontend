import { Route, Routes } from 'react-router-dom'
import HotelSearch from '../pages/HotelSearch'
import HotelDetails from '../pages/HotelDetails'

function SearchRoutes() {
	return (
		<Routes>
			<Route index element={<HotelSearch />} />
			<Route path='hoteldetails/:hotelId' element={<HotelDetails />} />
		</Routes>
	)
}

export default SearchRoutes
