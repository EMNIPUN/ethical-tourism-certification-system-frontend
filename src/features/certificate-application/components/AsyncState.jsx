import { AlertCircle, RefreshCw } from 'lucide-react'

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
            <div
                style={{
                    borderRadius: '1.4rem',
                    border: '1px solid rgba(207,216,230,0.75)',
                    background: 'rgba(255,255,255,0.96)',
                    boxShadow: '0 8px 28px -18px rgba(30,42,80,0.22)',
                    padding: '4rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.1rem',
                    textAlign: 'center',
                }}
            >
                <div className='ca-spinner' />
                <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a2345', margin: 0 }}>
                        {loadingMessage}
                    </p>
                    <p style={{ fontSize: '0.78rem', fontWeight: 500, color: '#8c98af', margin: '0.3rem 0 0' }}>
                        This usually takes a few seconds…
                    </p>
                </div>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div
                style={{
                    borderRadius: '1.4rem',
                    border: '1px solid rgba(200,50,50,0.2)',
                    background: 'rgba(200,50,50,0.04)',
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '1rem',
                        background: 'rgba(200,50,50,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c0392b',
                    }}
                >
                    <AlertCircle size={22} />
                </div>
                <div>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#1a2345', margin: 0 }}>
                        Failed to load data
                    </p>
                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#c0392b', margin: '0.4rem 0 0' }}>
                        {error || 'Something went wrong.'}
                    </p>
                    <p style={{ fontSize: '0.76rem', fontWeight: 500, color: '#8c98af', margin: '0.3rem 0 0' }}>
                        Check your connection and try again.
                    </p>
                </div>
                {typeof onRetry === 'function' ? (
                    <button type='button' onClick={onRetry} className='ca-btn-secondary'>
                        <RefreshCw size={14} />
                        {retryLabel}
                    </button>
                ) : null}
            </div>
        )
    }

    return children
}

export default AsyncState
