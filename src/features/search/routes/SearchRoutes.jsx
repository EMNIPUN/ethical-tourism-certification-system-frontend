import { Route, Routes } from 'react-router-dom'
import HotelSearch from '../pages/HotelSearch'

function SearchRoutes() {
	return (
		<Routes>
			<Route index element={<HotelSearch />} />
		</Routes>
	)
}

export default SearchRoutes
