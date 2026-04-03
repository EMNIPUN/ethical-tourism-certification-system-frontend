import { Navigate, Route, Routes } from 'react-router-dom'
import { FEATURE_ROUTES } from './featureRoutes'
import CertificateApplicationRoutes from '../../features/certificate-application/routes/CertificateApplicationRoutes'
import CertificateManagementRoutes from '../../features/certificate-management/routes/CertificateManagementRoutes'
import AuditRoutes from '../../features/audit/routes/AuditRoutes'
import SearchRoutes from '../../features/search/routes/SearchRoutes'
import AdminRoutes from '../../features/admin/routes/AdminRoutes'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import ProtectedRoute from '../../features/auth/components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path={FEATURE_ROUTES.landing} element={<Navigate to={FEATURE_ROUTES.login} replace />} />
      <Route path={FEATURE_ROUTES.login} element={<LoginPage />} />
      <Route path={FEATURE_ROUTES.register} element={<RegisterPage />} />

      <Route
        path={FEATURE_ROUTES.admin}
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path={FEATURE_ROUTES.certificateApplication}
        element={
          <ProtectedRoute>
            <CertificateApplicationRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={FEATURE_ROUTES.certificateManagement}
        element={
          <ProtectedRoute>
            <CertificateManagementRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={FEATURE_ROUTES.audit}
        element={
          <ProtectedRoute>
            <AuditRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={FEATURE_ROUTES.search}
        element={
          <ProtectedRoute>
            <SearchRoutes />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to={FEATURE_ROUTES.login} replace />} />
    </Routes>
  )
}

export default AppRoutes
