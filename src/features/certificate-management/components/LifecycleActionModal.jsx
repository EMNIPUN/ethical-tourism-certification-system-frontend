function LifecycleActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  isConfirmDisabled = false,
  onCancel,
  onConfirm,
  children,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4'>
      <div className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl'>
        <h3 className='text-xl font-bold text-slate-900'>{title}</h3>
        {description ? (
          <p className='mt-2 text-sm text-slate-600'>{description}</p>
        ) : null}

        <div className='mt-4 space-y-4'>{children}</div>

        <div className='mt-5 flex flex-wrap justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isSubmitting || isConfirmDisabled}
            className='rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Submitting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LifecycleActionModal
