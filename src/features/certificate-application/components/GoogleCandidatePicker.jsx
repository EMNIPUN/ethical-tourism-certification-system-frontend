import { CheckCircle2, MapPin, Search } from 'lucide-react'

/**
 * Google's image CDN supports arbitrary resizing via URL params.
 * Replace the size suffix (e.g. =w137-h92-k-no) with a larger one.
 */
function upgradeGoogleImageUrl(url, width = 800) {
    if (!url) return url
    // Replace =wNNN-hNNN-... or =sNNN patterns
    return url
        .replace(/=w\d+-h\d+(-[^=]*)?$/, `=w${width}-h${Math.round(width * 0.66)}-k-no`)
        .replace(/=s\d+(-[^=]*)?$/,      `=w${width}-h${Math.round(width * 0.66)}-k-no`)
}

function confidenceClass(conf) {
    if (conf >= 0.75) return 'ca-confidence-fill--high'
    if (conf >= 0.45) return 'ca-confidence-fill--medium'
    return 'ca-confidence-fill--low'
}

function CandidateCard({ candidate, selected, onSelect }) {
    const conf      = typeof candidate?.confidence === 'number' ? candidate.confidence : null
    const thumbnail = upgradeGoogleImageUrl(candidate?.thumbnail, 800)

    return (
        <button
            type='button'
            onClick={onSelect}
            className={`ca-candidate-card${selected ? ' ca-candidate-card--selected' : ''}`}
            style={{ padding: 0, overflow: 'hidden' }}
        >
            {/* Thumbnail cover */}
            <div style={{
                height: '7rem',
                background: thumbnail
                    ? `url('${thumbnail}') center/cover no-repeat`
                    : 'linear-gradient(135deg, rgba(88,104,216,0.08) 0%, rgba(88,104,216,0.03) 100%)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '1px solid rgba(207,216,230,0.6)',
            }}>
                {!thumbnail && <MapPin size={22} strokeWidth={1.4} style={{ color: 'rgba(88,104,216,0.25)' }} />}

                {/* Confidence badge on image */}
                {conf !== null ? (
                    <span style={{
                        position: 'absolute', top: '0.55rem', right: '0.55rem',
                        backdropFilter: 'blur(6px)',
                        background: conf >= 0.75
                            ? 'rgba(31,108,68,0.88)' : conf >= 0.45
                            ? 'rgba(146,98,10,0.88)' : 'rgba(160,64,16,0.88)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                    }}>
                        {Math.round(conf * 100)}% match
                    </span>
                ) : null}

                {/* Selected badge on image */}
                {selected ? (
                    <span style={{
                        position: 'absolute', top: '0.55rem', left: '0.55rem',
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        backdropFilter: 'blur(6px)',
                        background: 'rgba(88,104,216,0.9)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                    }}>
                        <CheckCircle2 size={10} strokeWidth={2.5} />Selected
                    </span>
                ) : null}
            </div>

            {/* Card body */}
            <div style={{ padding: '0.9rem 1rem 1rem' }}>
                {/* Title + address */}
                <div style={{ marginBottom: conf !== null ? '0.8rem' : 0 }}>
                    <p className='ca-candidate-title'>{candidate?.title || 'Unknown place'}</p>
                    <p className='ca-candidate-address'>
                        <MapPin size={11} strokeWidth={2.5} style={{ display: 'inline', marginRight: '0.2rem', verticalAlign: 'middle' }} />
                        {candidate?.address || 'No address provided'}
                    </p>
                    <span className='ca-candidate-place-id'>{candidate?.place_id}</span>
                </div>

                {/* Confidence bar */}
                {conf !== null ? (
                    <div>
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
            </div>
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
