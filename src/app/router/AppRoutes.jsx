import { Navigate, Route, Routes } from 'react-router-dom'
import { FEATURE_ROUTES } from './featureRoutes'
import CertificateApplicationRoutes from '../../features/certificate-application/routes/CertificateApplicationRoutes'
import CertificateManagementRoutes from '../../features/certificate-management/routes/CertificateManagementRoutes'
import AuditRoutes from '../../features/audit/routes/AuditRoutes'
import SearchRoutes from '../../features/search/routes/SearchRoutes'
import AdminRoutes from '../../features/admin/routes/AdminRoutes'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import AboutUsPage from '../../features/common/pages/AboutUsPage'
import ContactUsPage from '../../features/common/pages/ContactUsPage'
import PrivacyPolicyPage from '../../features/common/pages/PrivacyPolicyPage'
import TermsAndConditionsPage from '../../features/common/pages/TermsAndConditionsPage'
import LandingPage from '../../features/common/pages/LandingPage'
import ProtectedRoute from '../../features/auth/components/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path={FEATURE_ROUTES.landing} element={<LandingPage />} />
      <Route path={FEATURE_ROUTES.login} element={<LoginPage />} />
      <Route path={FEATURE_ROUTES.register} element={<RegisterPage />} />
      <Route path={FEATURE_ROUTES.about} element={<AboutUsPage />} />
      <Route path={FEATURE_ROUTES.contact} element={<ContactUsPage />} />
      <Route path={FEATURE_ROUTES.privacy} element={<PrivacyPolicyPage />} />
      <Route path={FEATURE_ROUTES.terms} element={<TermsAndConditionsPage />} />

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
      <Route path='*' element={<Navigate to={FEATURE_ROUTES.landing} replace />} />
    </Routes>
  )
}

export default AppRoutes
