import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    Mail,
    MapPin,
    Pencil,
    UploadCloud,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import EvidenceUploadFields from './EvidenceUploadFields'
import HotelApplicationForm from './HotelApplicationForm'

const STEPS = [
    {
        key: 'details',
        title: 'Hotel Details',
        description: 'Business identity & contact',
        icon: Building2,
    },
    {
        key: 'evidence',
        title: 'Evidence Uploads',
        description: 'Legal & HR documents',
        icon: UploadCloud,
    },
    {
        key: 'review',
        title: 'Review & Submit',
        description: 'Confirm before submitting',
        icon: CheckCircle2,
    },
]

const REQUIRED_PATHS = [
    'businessInfo.name',
    'businessInfo.registrationNumber',
    'businessInfo.licenseNumber',
    'businessInfo.businessType',
    'businessInfo.contact.ownerName',
    'businessInfo.contact.phone',
    'businessInfo.contact.email',
    'businessInfo.contact.address',
    'guestServices.facilities.numberOfRooms',
]

function isRequiredDraftComplete(draft) {
    return REQUIRED_PATHS.every((path) => {
        const value = path.split('.').reduce((c, s) => (c ? c[s] : undefined), draft)
        return value !== undefined && value !== null && value !== ''
    })
}

function get(draft, path) {
    return path.split('.').reduce((c, s) => (c ? c[s] : undefined), draft)
}

/* ── Stepper ─────────────────────────────────────────── */
function Stepper({ stepIndex }) {
    const pct = STEPS.length > 1 ? Math.round((stepIndex / (STEPS.length - 1)) * 100) : 0

    return (
        <div className='ca-stepper ca-animate-up'>
            <div className='ca-stepper-header'>
                <div>
                    <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8c98af' }}>
                        Application progress
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.92rem', fontWeight: 700, color: '#1a2345' }}>
                        Step {stepIndex + 1} of {STEPS.length} — {STEPS[stepIndex].title}
                    </p>
                </div>
                <div
                    style={{
                        background: stepIndex === STEPS.length - 1 ? 'rgba(31,108,68,0.09)' : 'rgba(88,104,216,0.09)',
                        border: `1px solid ${stepIndex === STEPS.length - 1 ? 'rgba(31,108,68,0.22)' : 'rgba(88,104,216,0.22)'}`,
                        color: stepIndex === STEPS.length - 1 ? '#1f6c44' : '#4a52c9',
                        borderRadius: '999px',
                        padding: '0.28rem 0.8rem',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    {pct}% complete
                </div>
            </div>

            {/* Progress track */}
            <div className='ca-progress-track'>
                <div className='ca-progress-fill' style={{ width: `${pct}%` }} />
            </div>

            {/* Step indicators */}
            <div className='ca-steps-grid'>
                {STEPS.map((step, i) => {
                    const Icon = step.icon
                    const active    = i === stepIndex
                    const completed = i < stepIndex

                    return (
                        <div
                            key={step.key}
                            className={`ca-step-item${active ? '' : completed ? '' : ' ca-step-item--pending'}`}
                        >
                            <div
                                className={`ca-step-bubble ${
                                    completed ? 'ca-step-bubble--done' :
                                    active    ? 'ca-step-bubble--active' :
                                                'ca-step-bubble--pending'
                                }`}
                            >
                                {completed
                                    ? <CheckCircle2 size={16} strokeWidth={2.5} />
                                    : <Icon size={16} strokeWidth={2} />
                                }
                            </div>
                            <div>
                                <p className='ca-step-label'>{step.title}</p>
                                <p className='ca-step-desc'>{step.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ── Review row ──────────────────────────────────────── */
function ReviewItem({ label, value }) {
    return (
        <div className='ca-review-item'>
            <p className='ca-review-label'>{label}</p>
            <p className='ca-review-value'>{value || '—'}</p>
        </div>
    )
}

/* ── Wizard ──────────────────────────────────────────── */
function HotelApplicationWizard({
    draft,
    step,
    onChangeDraft,
    onStepChange,
    onSubmit,
    submitting,
    submitLabel = 'Submit application',
    header,
    subheader,
}) {
    const [files, setFiles] = useState({
        legalDocuments: [],
        salarySlips:    null,
        staffHandbook:  null,
        hrPolicy:       null,
    })

    const stepIndex          = Math.max(0, Math.min(STEPS.length - 1, (step || 1) - 1))
    const canProceed         = useMemo(() => isRequiredDraftComplete(draft || {}), [draft])
    const isLastStep         = stepIndex === STEPS.length - 1

    function handleNext() {
        if (stepIndex === 0 && !canProceed) return
        onStepChange(stepIndex + 2)
    }

    function handleBack() {
        onStepChange(stepIndex)
    }

    const totalFiles =
        (files.legalDocuments?.length || 0) +
        (files.salarySlips ? 1 : 0) +
        (files.staffHandbook ? 1 : 0) +
        (files.hrPolicy ? 1 : 0)

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Hero header */}
            <header className='ca-hero ca-animate-up'>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                        <span className='ca-hero-eyebrow'>
                            <Pencil size={11} strokeWidth={3} />
                            Certificate Application
                        </span>
                        <h1 className='ca-hero-title' style={{ fontSize: 'clamp(1.4rem,2.8vw,2rem)' }}>{header}</h1>
                        <p className='ca-hero-desc'>{subheader}</p>
                    </div>
                    <div
                        style={{
                            background: 'rgba(88,104,216,0.07)',
                            border: '1px solid rgba(88,104,216,0.18)',
                            borderRadius: '0.85rem',
                            padding: '0.6rem 1rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#4a52c9',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                        Draft auto-saved
                    </div>
                </div>
            </header>

            {/* Step indicator */}
            <Stepper stepIndex={stepIndex} />

            {/* Step: Hotel details */}
            {stepIndex === 0 ? (
                <HotelApplicationForm
                    draft={draft}
                    onChange={(path, value) => onChangeDraft(path, value)}
                />
            ) : null}

            {/* Step: Evidence uploads */}
            {stepIndex === 1 ? (
                <EvidenceUploadFields files={files} onFilesChange={setFiles} />
            ) : null}

            {/* Step: Review */}
            {stepIndex === 2 ? (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {/* Business review */}
                    <div className='ca-section-card ca-animate-up'>
                        <div className='ca-section-header'>
                            <div className='ca-section-icon'>
                                <Building2 size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className='ca-section-title'>Review your application</p>
                                <p className='ca-section-desc'>Confirm all details are correct before submitting.</p>
                            </div>
                        </div>
                        <div className='ca-section-body'>
                            <div className='ca-review-row'>
                                <ReviewItem label='Hotel name'      value={get(draft, 'businessInfo.name')} />
                                <ReviewItem label='Business type'   value={get(draft, 'businessInfo.businessType')} />
                                <ReviewItem label='Registration no.' value={get(draft, 'businessInfo.registrationNumber')} />
                                <ReviewItem label='License no.'     value={get(draft, 'businessInfo.licenseNumber')} />
                            </div>

                            <div style={{ height: '1px', background: 'rgba(207,216,230,0.6)', margin: '1rem 0' }} />

                            <div className='ca-review-row'>
                                <ReviewItem label='Owner name'   value={get(draft, 'businessInfo.contact.ownerName')} />
                                <ReviewItem label='Email'        value={get(draft, 'businessInfo.contact.email')} />
                                <ReviewItem label='Phone'        value={get(draft, 'businessInfo.contact.phone')} />
                                <ReviewItem label='No. of rooms' value={get(draft, 'guestServices.facilities.numberOfRooms')} />
                            </div>

                            {/* Address full-width */}
                            <div style={{ marginTop: '0.75rem' }}>
                                <div className='ca-review-item' style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                    <MapPin size={14} strokeWidth={2.2} style={{ color: '#5868d8', marginTop: '0.15rem', flexShrink: 0 }} />
                                    <div>
                                        <p className='ca-review-label'>Address</p>
                                        <p className='ca-review-value'>{get(draft, 'businessInfo.contact.address') || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents summary */}
                    <div className='ca-section-card ca-animate-up-1'>
                        <div className='ca-section-header'>
                            <div className='ca-section-icon'>
                                <FileText size={18} strokeWidth={2} />
                            </div>
                            <div>
                                <p className='ca-section-title'>Uploaded documents</p>
                                <p className='ca-section-desc'>{totalFiles} file{totalFiles !== 1 ? 's' : ''} selected for upload.</p>
                            </div>
                        </div>
                        <div className='ca-section-body'>
                            <div style={{ display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                                {[
                                    { label: 'Legal documents', count: files.legalDocuments?.length || 0 },
                                    { label: 'Salary slips',    count: files.salarySlips ? 1 : 0 },
                                    { label: 'Staff handbook',  count: files.staffHandbook ? 1 : 0 },
                                    { label: 'HR policy',       count: files.hrPolicy ? 1 : 0 },
                                ].map(({ label, count }) => (
                                    <div
                                        key={label}
                                        style={{
                                            borderRadius: '0.85rem',
                                            border: `1px solid ${count > 0 ? 'rgba(31,108,68,0.2)' : 'rgba(207,216,230,0.7)'}`,
                                            background: count > 0 ? 'rgba(31,108,68,0.05)' : 'rgba(248,250,255,0.9)',
                                            padding: '0.75rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5878' }}>{label}</span>
                                        <span
                                            style={{
                                                fontSize: '0.74rem',
                                                fontWeight: 800,
                                                color: count > 0 ? '#1f6c44' : '#8c98af',
                                            }}
                                        >
                                            {count} {count === 1 ? 'file' : 'files'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {totalFiles === 0 ? (
                                <div
                                    style={{
                                        marginTop: '0.8rem',
                                        borderRadius: '0.85rem',
                                        border: '1px solid rgba(200,140,20,0.25)',
                                        background: 'rgba(200,140,20,0.06)',
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Mail size={14} strokeWidth={2.2} style={{ color: '#92620a', flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#92620a' }}>
                                        No documents uploaded. You can still submit and add them later during review.
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Action bar */}
            <div className='ca-action-bar ca-animate-up'>
                {/* Back button */}
                <button
                    type='button'
                    onClick={handleBack}
                    disabled={stepIndex === 0 || submitting}
                    className='ca-btn-secondary'
                >
                    <ArrowLeft size={15} strokeWidth={2.5} />
                    Back
                </button>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {stepIndex === 0 && !canProceed ? (
                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#c0392b' }}>
                            Complete all required fields to continue
                        </p>
                    ) : null}

                    {!isLastStep ? (
                        <button
                            type='button'
                            onClick={handleNext}
                            disabled={submitting || (stepIndex === 0 && !canProceed)}
                            className='ca-btn-primary'
                        >
                            Continue
                            <ArrowRight size={15} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={() => onSubmit({ draft: draft || {}, files })}
                            disabled={submitting}
                            className='ca-btn-primary'
                        >
                            {submitting ? (
                                <>
                                    <span
                                        style={{
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            animation: 'spin-smooth 0.75s linear infinite',
                                            display: 'inline-block',
                                        }}
                                    />
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    {submitLabel}
                                    <ArrowRight size={15} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HotelApplicationWizard
