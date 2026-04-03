import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { setAuditFilter } from '../store/auditSlice'
import { selectAuditFilter } from '../store/auditSelectors'

function AuditExample() {
  const dispatch = useAppDispatch()
  const filter = useAppSelector(selectAuditFilter)

  return (
    <section className='space-y-4'>
      <h1 className='text-2xl font-bold text-slate-900'>Audit Feature</h1>
      <p className='text-sm text-slate-600'>
        Audit filters are now tracked in Redux so list state stays consistent across screens.
      </p>

      <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <p className='text-sm font-medium text-slate-700'>Current filter: {filter}</p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {['all', 'pending', 'completed'].map((value) => (
            <button
              key={value}
              type='button'
              onClick={() => dispatch(setAuditFilter(value))}
              className={[
                'rounded-lg border px-3 py-1.5 text-sm capitalize transition',
                filter === value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AuditExample
