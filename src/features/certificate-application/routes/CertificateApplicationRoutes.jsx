import { Route, Routes } from 'react-router-dom'
import CertificateApplicationExample from '../pages/CertificateApplicationExample'

function CertificateApplicationRoutes() {
	return (
		<Routes>
			<Route index element={<CertificateApplicationExample />} />
		</Routes>
	)
}

export default CertificateApplicationRoutes
