import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isInitializing } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTarget = location.state?.from?.pathname || '/'

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(formData.email, formData.password)
      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10'>
      <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-bold text-slate-900'>Sign in</h1>
        <p className='mt-2 text-sm text-slate-600'>Access your Certiguard account.</p>

        {errorMessage ? (
          <p className='mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {errorMessage}
          </p>
        ) : null}

        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          <label className='block text-sm font-medium text-slate-700' htmlFor='email'>
            Email
            <input
              id='email'
              name='email'
              type='email'
              required
              value={formData.email}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              placeholder='you@example.com'
            />
          </label>

          <label className='block text-sm font-medium text-slate-700' htmlFor='password'>
            Password
            <input
              id='password'
              name='password'
              type='password'
              required
              value={formData.password}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              placeholder='Enter your password'
            />
          </label>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className='mt-4 text-sm text-slate-600'>
          New here?{' '}
          <Link to='/register' className='font-semibold text-blue-600 hover:text-blue-500'>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
