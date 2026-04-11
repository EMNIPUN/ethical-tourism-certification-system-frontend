import { CheckCircle2, MapPin, Search } from 'lucide-react'

function confidenceClass(conf) {
    if (conf >= 0.75) return 'ca-confidence-fill--high'
    if (conf >= 0.45) return 'ca-confidence-fill--medium'
    return 'ca-confidence-fill--low'
}

function CandidateCard({ candidate, selected, onSelect }) {
    const conf = typeof candidate?.confidence === 'number' ? candidate.confidence : null

    return (
        <button
            type='button'
            onClick={onSelect}
            className={`ca-candidate-card${selected ? ' ca-candidate-card--selected' : ''}`}
        >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p className='ca-candidate-title'>{candidate?.title || 'Unknown place'}</p>
                    <p className='ca-candidate-address'>
                        <MapPin size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: '0.2rem', verticalAlign: 'middle' }} />
                        {candidate?.address || 'No address provided'}
                    </p>
                    <span className='ca-candidate-place-id'>{candidate?.place_id}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                    {conf !== null ? (
                        <span
                            style={{
                                background: conf >= 0.75
                                    ? 'rgba(31,108,68,0.1)'
                                    : conf >= 0.45
                                        ? 'rgba(200,140,20,0.1)'
                                        : 'rgba(200,80,20,0.1)',
                                border: `1px solid ${conf >= 0.75
                                    ? 'rgba(31,108,68,0.25)'
                                    : conf >= 0.45
                                        ? 'rgba(200,140,20,0.25)'
                                        : 'rgba(200,80,20,0.25)'}`,
                                color: conf >= 0.75 ? '#1f6c44' : conf >= 0.45 ? '#92620a' : '#a04010',
                                borderRadius: '999px',
                                padding: '0.22rem 0.65rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {Math.round(conf * 100)}% match
                        </span>
                    ) : null}
                    {selected ? (
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: 'rgba(88,104,216,0.1)',
                                border: '1px solid rgba(88,104,216,0.25)',
                                color: '#4a52c9',
                                borderRadius: '999px',
                                padding: '0.22rem 0.65rem',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                            }}
                        >
                            <CheckCircle2 size={11} strokeWidth={2.5} />
                            Selected
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Confidence bar */}
            {conf !== null ? (
                <div style={{ marginTop: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8c98af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Match confidence
                        </span>
                    </div>
                    <div className='ca-confidence-bar'>
                        <div
                            className={`ca-confidence-fill ${confidenceClass(conf)}`}
                            style={{ width: `${Math.round(conf * 100)}%` }}
                        />
                    </div>
                </div>
            ) : null}
        </button>
    )
}

function GoogleCandidatePicker({ candidates = [], selectedPlaceId, onChange, allowManualEntry = true }) {
    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Section card */}
            <div className='ca-section-card'>
                <div className='ca-section-header'>
                    <div className='ca-section-icon'>
                        <Search size={18} strokeWidth={2} />
                    </div>
                    <div>
                        <p className='ca-section-title'>Choose Google Business profile</p>
                        <p className='ca-section-desc'>
                            Selecting the correct listing enables accurate review-based scoring for your certification.
                        </p>
                    </div>
                </div>
                {allowManualEntry ? (
                    <div className='ca-section-body'>
                        <div className='ca-field'>
                            <label className='ca-field-label'>
                                Or enter a place_id manually
                            </label>
                            <span className='ca-field-hint'>
                                Leave blank and click "No match" if none of the suggestions apply.
                            </span>
                            <input
                                value={selectedPlaceId || ''}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder='ChIJ… (optional)'
                                className='ca-input'
                                style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Candidates grid */}
            {candidates.length ? (
                <div>
                    <p
                        style={{
                            margin: '0 0 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#4a5878',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {candidates.length} suggested match{candidates.length !== 1 ? 'es' : ''}
                    </p>
                    <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {candidates.map((c) => (
                            <CandidateCard
                                key={c.place_id}
                                candidate={c}
                                selected={c.place_id === selectedPlaceId}
                                onSelect={() => onChange(c.place_id, c.thumbnail)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        borderRadius: '1.25rem',
                        border: '1px dashed rgba(207,216,230,0.9)',
                        background: 'rgba(248,250,255,0.7)',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '0.85rem',
                            background: 'rgba(207,216,230,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8c98af',
                            margin: '0 auto 0.75rem',
                        }}
                    >
                        <Search size={20} strokeWidth={1.5} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1a2345' }}>
                        No candidates found
                    </p>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', fontWeight: 500, color: '#8c98af' }}>
                        No Google Business listings were found automatically. Paste a place_id above or select "No match".
                    </p>
                </div>
            )}

            {/* No match button */}
            <button
                type='button'
                onClick={() => onChange('')}
                className='ca-btn-secondary'
                style={{ width: '100%', justifyContent: 'center' }}
            >
                No matching profile — proceed with manual review
            </button>
        </div>
    )
}

export default GoogleCandidatePicker
