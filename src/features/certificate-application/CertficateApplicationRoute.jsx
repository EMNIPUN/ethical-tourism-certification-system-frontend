import { Route, Routes } from 'react-router-dom'
import CertificateApplicationExample from './pages/CertificateApplicationExample'

function CertificateApplicationRoute() {
	return (
		<Routes>
			<Route index element={<CertificateApplicationExample />} />
		</Routes>
	)
}

export default CertificateApplicationRoute