import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { FEATURE_ROUTES } from '../../../app/router/featureRoutes'
import { useAuth } from '../hooks/useAuth'

function LogoutButton({ className = '', label = 'Log out', isCollapsed = false }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    navigate(FEATURE_ROUTES.login, { replace: true })
  }

  return (
    <button type='button' onClick={handleLogout} title={isCollapsed ? label : ''} className={className}>
      <LogOut size={18} />
      {!isCollapsed && <span>{label}</span>}
    </button>
  )
}

export default LogoutButton
