import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CertificateManagementLayout from '../pages/CertificateManagementLayout'
import CertificateOverviewPage from '../pages/CertificateOverviewPage'
import IssuanceHubPage from '../pages/IssuanceHubPage'
import CertificatesListPage from '../pages/CertificatesListPage'
import CertificateDetailsPage from '../pages/CertificateDetailsPage'

function LegacyIssuanceRedirect() {
  const location = useLocation()
  return <Navigate to={{ pathname: '../issuance', search: location.search }} replace />
}

function CertificateManagementRoutes() {
  return (
    <Routes>
      <Route element={<CertificateManagementLayout />}>
        <Route index element={<CertificateOverviewPage />} />
        <Route path='issuance' element={<IssuanceHubPage />} />
        <Route path='eligible-hotels' element={<LegacyIssuanceRedirect />} />
        <Route path='issue' element={<LegacyIssuanceRedirect />} />
        <Route path='certificates' element={<CertificatesListPage />} />
        <Route path='certificates/:certificateNumber' element={<CertificateDetailsPage />} />
      </Route>
      <Route path='*' element={<Navigate to='' replace />} />
    </Routes>
  )
}

export default CertificateManagementRoutes
