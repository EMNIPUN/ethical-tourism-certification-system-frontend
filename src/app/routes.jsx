import { Navigate, Route, Routes } from 'react-router-dom'
import CertificateApplicationRoute from '../features/certificate-application/CertficateApplicationRoute'
import CertificateManagementRoute from '../features/certificate-management/CertificateManagementRoute'
import AuditRoute from '../features/audit/AuditRoute'
import SearchRoute from '../features/search/SearchRoute'
import LandingPage from '../features/common/LandingPage'
import AdminRoute from '../features/common/pages/AdminRoute'
import LoginPage from '../features/common/auth/LoginPage'
import RegisterPage from '../features/common/auth/RegisterPage'
import ProtectedRoute from '../features/common/auth/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      <Route
        path='/admin/*'
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path='/certificate-application/*'
        element={
          <ProtectedRoute>
            <CertificateApplicationRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path='/certificate-management/*'
        element={
          <ProtectedRoute>
            <CertificateManagementRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path='/audit/*'
        element={
          <ProtectedRoute>
            <AuditRoute />
          </ProtectedRoute>
        }
      />
      <Route
        path='/search/*'
        element={
          <ProtectedRoute>
            <SearchRoute />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default AppRoutes
