import { Route, Routes } from 'react-router-dom'
import CertificatesRequest from './pages/CertificatesRequest'

function CertificateManagementRoute() {
  return (
    <Routes>
      <Route index element={<CertificatesRequest />} />
    </Routes>
  )
}

export default CertificateManagementRoute