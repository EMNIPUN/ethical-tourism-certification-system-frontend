import { Route, Routes } from 'react-router-dom'
import CertificatesRequest from '../pages/CertificatesRequest'

function CertificateManagementRoutes() {
  return (
    <Routes>
      <Route index element={<CertificatesRequest />} />
    </Routes>
  )
}

export default CertificateManagementRoutes
