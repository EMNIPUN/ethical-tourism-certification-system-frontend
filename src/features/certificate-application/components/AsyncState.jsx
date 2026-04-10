function AsyncState({ status = 'idle', error, loadingMessage = 'Loading...', children }) {
    if (status === 'loading') {
        return (
            <div className='flex items-center justify-center rounded-2xl border border-(--border-soft) bg-(--surface-white) p-10 shadow-(--shadow-soft)'>
                <div className='text-center'>
                    <div className='mx-auto h-10 w-10 animate-spin rounded-full border-4 border-(--border-soft) border-t-(--brand-700)' />
                    <p className='mt-4 text-sm font-semibold text-(--text-700)'>{loadingMessage}</p>
                </div>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                <p className='text-sm font-semibold text-(--error-600)'>{error || 'Something went wrong.'}</p>
            </div>
        )
    }

    return children
}

export default AsyncState
