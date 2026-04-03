import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { setCertificateManagementPage, setCertificateStatusFilter } from '../store/certificateManagementSlice'
import {
  selectCertificateManagementPage,
  selectCertificateStatusFilter,
} from '../store/certificateManagementSelectors'

function CertificatesRequest() {
  const dispatch = useAppDispatch()
  const statusFilter = useAppSelector(selectCertificateStatusFilter)
  const page = useAppSelector(selectCertificateManagementPage)

  return (
    <section className='space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
      <h1 className='text-2xl font-bold text-slate-900'>Certificate Management</h1>
      <p className='text-sm text-slate-600'>
        Redux manages management filters and pagination state for consistent admin workflows.
      </p>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <label className='block text-sm font-medium text-slate-700' htmlFor='statusFilter'>
          Status filter
          <select
            id='statusFilter'
            value={statusFilter}
            onChange={(event) => dispatch(setCertificateStatusFilter(event.target.value))}
            className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          >
            <option value='ALL'>ALL</option>
            <option value='ACTIVE'>ACTIVE</option>
            <option value='EXPIRED'>EXPIRED</option>
            <option value='REVOKED'>REVOKED</option>
            <option value='INACTIVE'>INACTIVE</option>
          </select>
        </label>

        <div className='flex items-end gap-2'>
          <button
            type='button'
            onClick={() => dispatch(setCertificateManagementPage(Math.max(1, page - 1)))}
            className='rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100'
          >
            Previous
          </button>
          <span className='pb-2 text-sm text-slate-700'>Page {page}</span>
          <button
            type='button'
            onClick={() => dispatch(setCertificateManagementPage(page + 1))}
            className='rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100'
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default CertificatesRequest
