import { Route, Routes } from 'react-router-dom'
import AuditLayout from '../pages/AuditLayout'
import AuditDashboard from '../pages/AuditDashboard'
import AuditDetails from '../pages/AuditDetails'

function AuditRoutes() {
	return (
		<Routes>
			<Route element={<AuditLayout />}>
				<Route index element={<AuditDashboard />} />
				<Route path=":id" element={<AuditDetails />} />
			</Route>
		</Routes>
	)
}

export default AuditRoutes
