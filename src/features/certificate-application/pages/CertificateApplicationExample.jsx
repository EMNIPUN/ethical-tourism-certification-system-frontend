import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import LogoutButton from '../../auth/components/LogoutButton'
import { setApplicationStep } from '../store/certificateApplicationSlice'
import { selectCertificateApplicationStep } from '../store/certificateApplicationSelectors'

function CertificateApplicationExample() {
  const dispatch = useAppDispatch()
  const currentStep = useAppSelector(selectCertificateApplicationStep)

  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold text-slate-900'>Certificate Application Feature</h1>
        <LogoutButton className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100' />
      </div>
      <p className='text-sm text-slate-600'>
        Application progress is managed in Redux, ready for multi-step form expansion.
      </p>

      <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
        <p className='text-sm font-medium text-slate-700'>Current step: {currentStep}</p>
        <div className='mt-3 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => dispatch(setApplicationStep(Math.max(1, currentStep - 1)))}
            className='rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Previous Step
          </button>
          <button
            type='button'
            onClick={() => dispatch(setApplicationStep(currentStep + 1))}
            className='rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100'
          >
            Next Step
          </button>
        </div>
      </div>
    </section>
  )
}

export default CertificateApplicationExample

