function AsyncState({
    status = 'idle',
    error,
    loadingMessage = 'Loading...',
    onRetry,
    retryLabel = 'Try again',
    children,
}) {
    if (status === 'loading') {
        return (
            <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-10 shadow-(--shadow-soft)'>
                <div className='mx-auto max-w-md text-center'>
                    <div className='mx-auto h-11 w-11 animate-spin rounded-full border-4 border-(--border-soft) border-t-(--brand-700)' />
                    <p className='mt-5 text-sm font-semibold text-(--text-700)'>{loadingMessage}</p>
                    <p className='mt-2 text-xs font-medium text-(--text-500)'>This usually takes a few seconds.</p>
                </div>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-8 shadow-(--shadow-soft)'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                        <p className='text-sm font-bold text-(--text-950)'>We couldn\'t load this data</p>
                        <p className='mt-2 text-sm font-semibold text-(--error-600)'>{error || 'Something went wrong.'}</p>
                        <p className='mt-2 text-xs font-medium text-(--text-500)'>Check your connection and try again.</p>
                    </div>

                    {typeof onRetry === 'function' ? (
                        <button
                            type='button'
                            onClick={onRetry}
                            className='inline-flex items-center justify-center rounded-xl bg-(--brand-700) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105'
                        >
                            {retryLabel}
                        </button>
                    ) : null}
                </div>
            </div>
        )
    }

    return children
}

export default AsyncState
