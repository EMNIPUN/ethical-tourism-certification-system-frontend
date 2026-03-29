import { Navigate, Route, Routes } from 'react-router-dom'
import CertificateManagementRoute from '../../certificate-management/CertificateManagementRoute'
import AdminLayout from './AdminLayout'
import AdminDashboard from './AdminDashboard'

function PlaceholderPage({ title, description }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
      <h2 className='text-2xl font-black text-slate-900'>{title}</h2>
      <p className='mt-2 max-w-2xl text-sm text-slate-600'>{description}</p>
    </div>
  )
}

function AdminRoute() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path='certificate-management/*' element={<CertificateManagementRoute />} />
        <Route
          path='user-management'
          element={
            <PlaceholderPage
              title='User Management'
              description='Example admin page. You can add user lifecycle management features here next.'
            />
          }
        />
        <Route
          path='audit-management'
          element={
            <PlaceholderPage
              title='Audit Management'
              description='Example admin page. You can integrate audit workflows here when ready.'
            />
          }
        />
        <Route
          path='hotel-management'
          element={
            <PlaceholderPage
              title='Hotel Management'
              description='Example admin page. You can build hotel profile and approval tools here.'
            />
          }
        />
      </Route>
      <Route path='*' element={<Navigate to='/admin' replace />} />
    </Routes>
  )
}

export default AdminRoute
