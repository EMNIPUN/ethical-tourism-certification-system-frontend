import { useNavigate } from 'react-router-dom'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'
import { useAuth } from '../hooks/useAuth'

function LogoutButton({ className = '', children, label = 'Log out', ...props }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate(FEATURE_ROUTES.login, { replace: true })
  }

  return (
    <button type='button' onClick={handleLogout} className={className} {...props}>
      {children || label}
    </button>
  )
}

export default LogoutButton
