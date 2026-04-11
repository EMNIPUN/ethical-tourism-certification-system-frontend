import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../pages/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import AuditDashboard from '../../audit/pages/AuditDashboard'

function PlaceholderPage({ title, description }) {
  return (
    <section className='flex min-h-[100vh] items-center justify-center rounded-2xl border border-[#e2e8f2] bg-white p-8 text-center shadow-[0_16px_35px_-28px_rgba(28,44,84,0.2)]'>
      <div className='max-w-2xl'>
        <h2 className='text-4xl font-semibold tracking-tight text-[#1f2b49]'>{title}</h2>
        <p className='mt-3 text-base text-[#5f6f8c]'>{description}</p>
      </div>
    </section>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route
          path='certificate-management'
          element={
            <PlaceholderPage
              title='Certificate Management'
              description='Manage certificate requests, approvals, renewals, and lifecycle updates for all registered hotels.'
            />
          }
        />
        <Route
          path='user-management'
          element={
            <PlaceholderPage
              title='User Management'
              description='Manage user accounts, assign roles, and control access for admins, auditors, tourists, and hotel owners.'
            />
          }
        />
        <Route
          path='audit-management'
          element={<AuditDashboard />}
        />
        <Route
          path='hotel-management'
          element={
            <PlaceholderPage
              title='Hotel Management'
              description='Review hotel profiles, approvals, and operational status across the certification ecosystem.'
            />
          }
        />
      </Route>
      <Route path='*' element={<Navigate to='/admin' replace />} />
    </Routes>
  )
}

export default AdminRoutes
