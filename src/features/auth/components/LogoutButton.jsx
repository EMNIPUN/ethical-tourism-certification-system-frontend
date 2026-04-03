import { useNavigate } from 'react-router-dom'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'
import { useAuth } from '../hooks/useAuth'

function LogoutButton({ className = '', label = 'Log out' }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate(FEATURE_ROUTES.login, { replace: true })
  }

  return (
    <button type='button' onClick={handleLogout} className={className}>
      {label}
    </button>
  )
}

export default LogoutButton
