import { Navigate, Route, Routes } from 'react-router-dom'
import CertificateApplicationRoute from '../features/certificate-application/CertficateApplicationRoute'
import CertificateManagementRoute from '../features/certificate-management/CertificateManagementRoute'
import AuditRoute from '../features/audit/AuditRoute'
import SearchRoute from '../features/search/SearchRoute'
import LandingPage from '../features/common/LandingPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/certificate-application/*" element={<CertificateApplicationRoute />} />
      <Route path="/certificate-management/*" element={<CertificateManagementRoute />} />
      <Route path="/audit/*" element={<AuditRoute />} />
      <Route path="/search/*" element={<SearchRoute />} />
    </Routes>
  )
}

export default AppRoutes
