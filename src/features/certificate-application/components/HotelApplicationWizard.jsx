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
            {/* ── Premium Hero Header ─────────────────────────────────────────── */}
            <header className='ca-animate-up' style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                padding: '3rem 3.5rem', 
                borderRadius: '1.5rem', 
                background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', 
                color: '#fff', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                marginBottom: '1rem'
            }}>
                {/* Background glowing effects */}
                <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%', background: 'radial-gradient(circle, rgba(88,104,216,0.12) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '80%', height: '150%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
                
                {/* Abstract grid overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                    <div style={{ maxWidth: '650px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                            <Pencil size={13} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            Certificate Application
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 1rem 0', color: '#f8fafc' }}>
                            {header}
                        </h1>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#94a3b8', margin: 0, fontWeight: 400 }}>
                            {subheader}
                        </p>
                    </div>
                    
                    <div style={{ flexShrink: 0 }}>
                        <div
                            style={{
                                background: 'linear-gradient(135deg, rgba(88,104,216,0.1) 0%, rgba(88,104,216,0.2) 100%)',
                                border: '1px solid rgba(88,104,216,0.3)',
                                borderRadius: '1rem',
                                padding: '0.75rem 1.25rem',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#a5b4fc',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <CheckCircle2 size={16} strokeWidth={2.5} style={{ color: '#818cf8' }} />
                            Draft auto-saved
                        </div>
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
                    <div className='ca-section-card ca-animate-up' style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
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
                    <div className='ca-section-card ca-animate-up-1' style={{ borderRadius: '1.25rem', border: '1px solid rgba(226,232,240,0.8)', background: '#ffffff', boxShadow: '0 4px 20px -10px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
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
                            style={{ background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)', border: 'none', color: '#fff', padding: '0 1.5rem', height: '2.8rem', borderRadius: '0.85rem' }}
                        >
                            Continue
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={() => onSubmit({ draft: draft || {}, files })}
                            disabled={submitting}
                            className='ca-btn-primary'
                            style={{ background: 'linear-gradient(135deg, #5868d8 0%, #4a52c9 100%)', boxShadow: '0 4px 15px -4px rgba(88,104,216,0.4)', border: 'none', color: '#fff', padding: '0 1.5rem', height: '2.8rem', borderRadius: '0.85rem' }}
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
