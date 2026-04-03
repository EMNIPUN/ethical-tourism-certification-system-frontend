import LogoutButton from '../../auth/components/LogoutButton'

function AuditExample() {
  return (
    <section className='relative flex min-h-screen items-center justify-center bg-[var(--surface-canvas)] p-6 text-center'>
      <LogoutButton className='absolute right-6 top-6 rounded-lg border border-[#d5dcea] bg-white px-3 py-2 text-sm font-semibold text-[#48577a] transition hover:bg-[#f2f6ff]' />
      <div className='w-full max-w-2xl rounded-2xl border border-[#e2e8f2] bg-white p-8 shadow-[0_16px_35px_-28px_rgba(28,44,84,0.2)]'>
        <h1 className='text-4xl font-semibold tracking-tight text-[#1f2b49]'>Auditor Workspace</h1>
        <p className='mt-3 text-base text-[#5f6f8c]'>
          Review compliance evidence, complete audit assessments, and submit certification recommendations.
        </p>
      </div>
    </section>
  )
}

export default AuditExample

