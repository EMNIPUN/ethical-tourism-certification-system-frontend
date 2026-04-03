import { Route, Routes } from 'react-router-dom'
import SearchExample from '../pages/SearchExample'

function SearchRoutes() {
	return (
		<Routes>
			<Route index element={<SearchExample />} />
		</Routes>
	)
}

export default SearchRoutes
