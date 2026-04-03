import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AUTH_ROLES } from '../services/authService'
import { getDashboardPathByRole } from '../utils/roleRedirect'

function RegisterPage() {
  const navigate = useNavigate()
  const { clearError, error, isAuthenticated, isInitializing, register, status, user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Tourist',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const isSubmitting = status === 'loading'

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    clearError()

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    try {
      const registerResponse = await register(formData)
      const resolvedRole = registerResponse?.user?.role || registerResponse?.data?.role || formData.role
      navigate(getDashboardPathByRole(resolvedRole), { replace: true })
    } catch (requestError) {
      setErrorMessage(requestError.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10'>
      <div className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h1 className='text-2xl font-bold text-slate-900'>Create account</h1>
        <p className='mt-2 text-sm text-slate-600'>Register to use protected Certiguard modules.</p>

        {errorMessage || error ? (
          <p className='mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {errorMessage || error}
          </p>
        ) : null}

        <form className='mt-6 grid grid-cols-1 gap-4' onSubmit={handleSubmit}>
          <label className='block text-sm font-medium text-slate-700' htmlFor='name'>
            Full name
            <input
              id='name'
              name='name'
              type='text'
              required
              value={formData.name}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              placeholder='Your name'
            />
          </label>

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
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              placeholder='At least 6 characters'
            />
          </label>

          <label className='block text-sm font-medium text-slate-700' htmlFor='role'>
            Role
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            >
              {AUTH_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-1 w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className='mt-4 text-sm text-slate-600'>
          Already have an account?{' '}
          <Link to='/login' className='font-semibold text-blue-600 hover:text-blue-500'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
