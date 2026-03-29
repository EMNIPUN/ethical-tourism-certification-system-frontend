import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { getDashboardPathByRole, isAllowedRole } from './roleRedirect'

function ProtectedRoute({ children, roles }) {
  const location = useLocation()
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 text-slate-700'>
        Checking your session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  if (roles?.length && !isAllowedRole(user?.role, roles)) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />
  }

  return children
}

export default ProtectedRoute
