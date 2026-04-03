import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'

function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className='min-h-screen w-full bg-slate-50 px-6 py-12 text-slate-900'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-8'>
        <div>
          <h1 className='text-4xl font-bold sm:text-5xl'>Certiguard - Landing Page</h1>
          <p className='mt-3 text-base text-slate-600 sm:text-lg'>
            Welcome to Certiguard. Sign in to access protected feature modules.
          </p>

          <div className='mt-5 flex flex-wrap items-center gap-3'>
            {isAuthenticated ? (
              <>
                <span className='rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700'>
                  Signed in as {user?.name || user?.email} ({user?.role})
                </span>
                <button
                  type='button'
                  onClick={logout}
                  className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700'
                >
                  Log in
                </Link>
                <Link
                  to='/register'
                  className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default LandingPage
