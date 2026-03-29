import { Navigate, Route, Routes } from 'react-router-dom'
import CertificateManagementLayout from './pages/CertificateManagementLayout'
import CertificateOverviewPage from './pages/CertificateOverviewPage'
import EligibleHotelsPage from './pages/EligibleHotelsPage'
import IssueCertificatePage from './pages/IssueCertificatePage'
import CertificatesListPage from './pages/CertificatesListPage'
import CertificateDetailsPage from './pages/CertificateDetailsPage'

function CertificateManagementRoute() {
  return (
    <Routes>
      <Route element={<CertificateManagementLayout />}>
        <Route index element={<CertificateOverviewPage />} />
        <Route path='eligible-hotels' element={<EligibleHotelsPage />} />
        <Route path='issue' element={<IssueCertificatePage />} />
        <Route path='certificates' element={<CertificatesListPage />} />
        <Route path='certificates/:certificateNumber' element={<CertificateDetailsPage />} />
      </Route>
      <Route path='*' element={<Navigate to='' replace />} />
    </Routes>
  )
}

export default CertificateManagementRoute