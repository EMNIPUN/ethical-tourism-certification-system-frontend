import AppProviders from './app/providers/AppProviders'
import AppRoutes from './app/router/AppRoutes'
import AppFooter from './features/search/components/AppFooter'

function App() {
  return (
    <AppProviders>
      <div className='app-layout'>
        <main className='app-content'>
          <AppRoutes />
        </main>
        <AppFooter />
      </div>
    </AppProviders>
  )
}

export default App
