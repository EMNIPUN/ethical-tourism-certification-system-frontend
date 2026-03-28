import { Route, Routes } from 'react-router-dom'
import AuditExample from './pages/AuditExample'

function AuditRoute() {
	return (
		<Routes>
			<Route index element={<AuditExample />} />
		</Routes>
	)
}

export default AuditRoute