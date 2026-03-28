import React from 'react'
import { Link } from 'react-router-dom'

function LandingPage() {
  const featureLinks = [
    {
      to: '/certificate-application',
      title: 'Certificate Application',
      description: 'Open the certificate application example page.'
    },
    {
      to: '/certificate-management',
      title: 'Certificate Management',
      description: 'Open the certificate management example page.'
    },
    {
      to: '/audit',
      title: 'Audit',
      description: 'Open the audit example page.'
    },
    {
      to: '/search',
      title: 'Search',
      description: 'Open the search example page.'
    }
  ]

  return (
    <div className='min-h-screen w-full bg-slate-50 px-6 py-12 text-slate-900'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-8'>
        <div>
          <h1 className='text-4xl font-bold sm:text-5xl'>Certiguard - Landing Page</h1>
          <p className='mt-3 text-base text-slate-600 sm:text-lg'>
            Welcome to Certiguard. Choose a feature module to start development.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {featureLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              <p className='text-lg font-semibold'>{link.title}</p>
              <p className='mt-1 text-sm text-slate-600'>{link.description}</p>
              <p className='mt-3 text-sm font-medium text-blue-600'>Go to {link.to}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LandingPage