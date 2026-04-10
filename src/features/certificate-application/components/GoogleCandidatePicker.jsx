import { CheckCircle2 } from 'lucide-react'

function CandidateCard({ candidate, selected, onSelect }) {
    return (
        <button
            type='button'
            onClick={onSelect}
            className={
                'w-full rounded-2xl border p-5 text-left shadow-(--shadow-soft) transition focus:outline-none focus:ring-4 focus:ring-(--brand-700)/15 ' +
                (selected
                    ? 'border-(--brand-700) bg-(--surface-white)'
                    : 'border-(--border-soft) bg-(--surface-white) hover:border-(--brand-700)')
            }
        >
            <div className='flex items-start justify-between gap-4'>
                <div>
                    <h3 className='text-base font-bold text-(--text-950)'>{candidate?.title || 'Unknown place'}</h3>
                    <p className='mt-1 text-sm font-medium text-(--text-700)'>{candidate?.address || 'No address provided'}</p>
                    <p className='mt-3 text-xs font-semibold text-(--text-500)'>place_id: {candidate?.place_id}</p>
                </div>
                <div className='flex flex-col items-end gap-2'>
                    {typeof candidate?.confidence === 'number' ? (
                        <span className='badge-chip'>Confidence {Math.round(candidate.confidence * 100)}%</span>
                    ) : null}
                    {selected ? (
                        <span className='inline-flex items-center gap-2 rounded-xl bg-(--success-100) px-3 py-2 text-xs font-bold text-(--success-600)'>
                            <CheckCircle2 size={16} /> Selected
                        </span>
                    ) : null}
                </div>
            </div>
        </button>
    )
}

function GoogleCandidatePicker({ candidates = [], selectedPlaceId, onChange, allowManualEntry = true }) {
    return (
        <div className='grid gap-5'>
            <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                <h2 className='text-lg font-bold text-(--text-950)'>Choose the matching Google Business profile</h2>
                <p className='mt-1 text-sm font-medium text-(--text-700)'>This improves review scoring accuracy and reduces manual verification time.</p>

                {allowManualEntry ? (
                    <label className='mt-5 block text-sm font-semibold text-(--text-950)'>
                        Or paste a place_id
                        <input
                            value={selectedPlaceId || ''}
                            onChange={(event) => onChange(event.target.value)}
                            placeholder='place_id (optional)'
                            className='mt-2 h-12 w-full rounded-xl border border-(--border-soft) bg-white px-4 text-sm text-(--text-950) outline-none transition focus:border-(--brand-700) focus:ring-4 focus:ring-(--brand-700)/15'
                        />
                        <p className='mt-2 text-xs font-medium text-(--text-500)'>Leave blank and select “No match” if none apply.</p>
                    </label>
                ) : null}
            </div>

            {candidates.length ? (
                <div className='grid gap-4 md:grid-cols-2'>
                    {candidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.place_id}
                            candidate={candidate}
                            selected={candidate.place_id === selectedPlaceId}
                            onSelect={() => onChange(candidate.place_id)}
                        />
                    ))}
                </div>
            ) : (
                <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                    <p className='text-sm font-semibold text-(--text-700)'>No candidates returned. You can still paste a place_id above or continue with “No match”.</p>
                </div>
            )}

            <button
                type='button'
                onClick={() => onChange('')}
                className='inline-flex w-full items-center justify-center rounded-xl border border-(--border-soft) bg-(--surface-white) px-4 py-3 text-sm font-semibold text-(--text-700) transition hover:border-(--brand-700) hover:text-(--brand-900)'
            >
                No match (manual review)
            </button>
        </div>
    )
}

export default GoogleCandidatePicker
