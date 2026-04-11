import AppProviders from './app/providers/AppProviders'
import AppRoutes from './app/router/AppRoutes'
import AppFooter from './features/search/components/AppFooter'
import { useLocation } from 'react-router-dom'

const FOOTER_HIDDEN_PATHS = ['/', '/login', '/register']

function AppShell() {
  const location = useLocation()
  const shouldHideFooter = FOOTER_HIDDEN_PATHS.includes(location.pathname)

  return (
    <div className='app-layout'>
      <main className='app-content'>
        <AppRoutes />
      </main>
      {!shouldHideFooter ? <AppFooter /> : null}
    </div>
  )
}

function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}

export default App
