import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

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

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to='/' replace />
  }

  return children
}

export default ProtectedRoute
