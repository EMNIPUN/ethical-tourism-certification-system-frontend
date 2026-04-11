import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPathByRole } from '../utils/roleRedirect'
import AuthArtPanel from '../components/AuthArtPanel'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearError, error, isAuthenticated, isInitializing, login, status, user } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const isSubmitting = status === 'loading'
  const registrationSuccess = Boolean(location.state?.registrationSuccess)
  const registeredEmail = location.state?.registeredEmail || ''

  const roleDashboardPath = getDashboardPathByRole(user?.role)
  const redirectTarget = roleDashboardPath

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    clearError()

    try {
      const loginResponse = await login(formData.email, formData.password)
      const resolvedRole = loginResponse?.user?.role || loginResponse?.data?.role || loginResponse?.role
      navigate(getDashboardPathByRole(resolvedRole), { replace: true })
    } catch (requestError) {
      setLocalError(requestError.message || 'Login failed. Please try again.')
    }
  }

  return (
    <main className='auth-page-transition h-screen w-screen overflow-hidden bg-[var(--surface-canvas)]'>
      <div className='grid h-full w-full overflow-hidden border border-[#d5dced] bg-[#eef2f8] shadow-[0_10px_30px_-20px_rgba(21,34,67,0.5)] md:grid-cols-2'>
        <section className='flex items-center justify-center bg-[#f7f8fb] px-6 py-8 sm:px-8 md:px-12'>
          <div className='w-full max-w-[460px]'>
            <div className='mb-16 inline-flex h-11 w-11 items-center justify-center rounded-md   text-[#4c46df]'>
              <Sparkles size={58} strokeWidth={1} />
            </div>

            <h1 className='text-[44px] font-semibold leading-none tracking-[-0.02em] text-[#0f1730]'>Welcome back !</h1>
            <p className='mt-3 text-[15px] text-[#5d6984]'>Enter to get unlimited access to data and information.</p>

            {registrationSuccess ? (
              <p className='mt-5 rounded-xl border border-[#b7dec8] bg-[var(--success-100)] px-4 py-3 text-sm font-medium text-[var(--success-600)]'>
                Registration successful. Sign in with {registeredEmail || 'your new account credentials'}.
              </p>
            ) : null}

            {error || localError ? (
              <p className='mt-5 rounded-xl border border-[#ebc1c1] bg-[var(--error-100)] px-4 py-3 text-sm font-medium text-[var(--error-600)]'>
                {error || localError}
              </p>
            ) : null}

            <form className='mt-8 space-y-5' onSubmit={handleSubmit}>
              <label className='block text-sm font-semibold text-[#1d2848]' htmlFor='email'>
                Email <span className='text-[#e24b64]'>*</span>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='mt-2 h-12 w-full rounded-lg border border-[#d7dceb] bg-white px-4 text-sm text-[#1d2848] outline-none transition focus:border-[#6573ea] focus:ring-4 focus:ring-[#6573ea]/15'
                  placeholder='Enter your mail address'
                />
              </label>

              <label className='block text-sm font-semibold text-[#1d2848]' htmlFor='password'>
                Password <span className='text-[#e24b64]'>*</span>
                <div className='relative mt-2'>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='h-12 w-full rounded-lg border border-[#d7dceb] bg-white px-4 pr-12 text-sm text-[#1d2848] outline-none transition focus:border-[#6573ea] focus:ring-4 focus:ring-[#6573ea]/15'
                    placeholder='Enter password'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((current) => !current)}
                    className='absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-[#8a96ad] transition hover:text-[#4e57c7]'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <div className='flex items-center justify-between gap-3 text-sm'>
                <label className='inline-flex items-center gap-2 text-[#1d2848]'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded border border-[#c6cee2] text-[#514fe0] focus:ring-[#514fe0]/30'
                  />
                  Remember me
                </label>
                <span className='text-[#4f58cd]'>Forgot your password ?</span>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='mt-1 inline-flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#6a67ea] to-[#4f46de] text-base font-medium text-white shadow-[0_14px_30px_-18px_rgba(79,70,222,0.8)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSubmitting ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <p className='mt-8 text-center text-[15px] text-[#121f3d]'>
              Don&apos;t have an account ?{' '}
              <Link to='/register' className='font-medium text-[#474fbe] '>
                Register here
              </Link>
            </p>
          </div>
        </section>

        <AuthArtPanel />
      </div>
    </main>
  )
}

export default LoginPage
