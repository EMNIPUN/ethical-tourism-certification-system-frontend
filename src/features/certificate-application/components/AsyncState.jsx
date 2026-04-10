function AsyncState({ status = 'idle', error, loadingMessage = 'Loading...', children }) {
    if (status === 'loading') {
        return (
            <div className='flex items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-10 shadow-[var(--shadow-soft)]'>
                <div className='text-center'>
                    <div className='mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-soft)] border-t-[var(--brand-700)]' />
                    <p className='mt-4 text-sm font-semibold text-[var(--text-700)]'>{loadingMessage}</p>
                </div>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div className='rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-white)] p-6 shadow-[var(--shadow-soft)]'>
                <p className='text-sm font-semibold text-[var(--error-600)]'>{error || 'Something went wrong.'}</p>
            </div>
        )
    }

    return children
}

export default AsyncState
