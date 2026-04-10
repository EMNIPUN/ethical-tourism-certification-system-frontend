import { ArrowLeft, ArrowRight, CheckCircle2, FileText, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import EvidenceUploadFields from './EvidenceUploadFields'
import HotelApplicationForm from './HotelApplicationForm'

const STEPS = [
    {
        key: 'details',
        title: 'Hotel details',
        description: 'Business identity and contact info.',
        icon: FileText,
    },
    {
        key: 'evidence',
        title: 'Evidence uploads',
        description: 'Legal and employee policy documents.',
        icon: UploadCloud,
    },
    {
        key: 'review',
        title: 'Review & submit',
        description: 'Confirm everything looks correct.',
        icon: CheckCircle2,
    },
]

function isRequiredDraftComplete(draft) {
    const requiredPaths = [
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

    return requiredPaths.every((path) => {
        const value = path.split('.').reduce((cursor, segment) => (cursor ? cursor[segment] : undefined), draft)
        return value !== undefined && value !== null && value !== ''
    })
}

function SummaryRow({ label, value }) {
    return (
        <div className='flex items-start justify-between gap-4 rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
            <span className='text-xs font-bold uppercase tracking-[0.08em] text-(--text-500)'>{label}</span>
            <span className='text-sm font-semibold text-(--text-950)'>{value || '—'}</span>
        </div>
    )
}

function Stepper({ stepIndex }) {
    return (
        <div className='grid gap-3 rounded-2xl border border-(--border-soft) bg-(--surface-white) p-5 shadow-(--shadow-soft) md:grid-cols-3'>
            {STEPS.map((step, index) => {
                const Icon = step.icon
                const active = index === stepIndex
                const completed = index < stepIndex

                return (
                    <div
                        key={step.key}
                        className={
                            'flex items-start gap-4 rounded-xl border px-4 py-3 transition ' +
                            (active
                                ? 'border-(--brand-700) bg-(--surface-soft)'
                                : completed
                                    ? 'border-(--border-soft) bg-(--surface-white)'
                                    : 'border-(--border-soft) bg-(--surface-white)')
                        }
                    >
                        <span
                            className={
                                'inline-flex h-10 w-10 items-center justify-center rounded-xl ' +
                                (active || completed
                                    ? 'bg-(--brand-700) text-white'
                                    : 'bg-(--surface-soft) text-(--brand-900)')
                            }
                        >
                            <Icon size={18} />
                        </span>
                        <div>
                            <p className='text-sm font-bold text-(--text-950)'>{step.title}</p>
                            <p className='mt-1 text-xs font-medium text-(--text-700)'>{step.description}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

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
        salarySlips: null,
        staffHandbook: null,
        hrPolicy: null,
    })

    const stepIndex = Math.max(0, Math.min(STEPS.length - 1, (step || 1) - 1))
    const canProceedFromDetails = useMemo(() => isRequiredDraftComplete(draft || {}), [draft])

    function handleNext() {
        if (stepIndex === 0 && !canProceedFromDetails) {
            return
        }

        onStepChange(stepIndex + 2)
    }

    function handleBack() {
        onStepChange(stepIndex)
    }

    return (
        <div className='grid gap-6'>
            <header className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-7 shadow-(--shadow-soft)'>
                <p className='text-xs font-extrabold uppercase tracking-[0.12em] text-(--brand-900)'>Certificate application</p>
                <h1 className='mt-2 text-3xl font-bold tracking-tight text-(--text-950)'>{header}</h1>
                <p className='mt-2 max-w-3xl text-sm font-medium text-(--text-700)'>{subheader}</p>
            </header>

            <Stepper stepIndex={stepIndex} />

            {stepIndex === 0 ? (
                <HotelApplicationForm
                    draft={draft}
                    onChange={(path, value) => onChangeDraft(path, value)}
                />
            ) : null}

            {stepIndex === 1 ? <EvidenceUploadFields files={files} onFilesChange={setFiles} /> : null}

            {stepIndex === 2 ? (
                <div className='grid gap-6'>
                    <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
                        <h2 className='text-lg font-bold text-(--text-950)'>Review</h2>
                        <p className='mt-1 text-sm font-medium text-(--text-700)'>Confirm the critical fields before submitting.</p>

                        <div className='mt-6 grid gap-3 md:grid-cols-2'>
                            <SummaryRow label='Hotel name' value={draft?.businessInfo?.name} />
                            <SummaryRow label='Business type' value={draft?.businessInfo?.businessType} />
                            <SummaryRow label='Registration' value={draft?.businessInfo?.registrationNumber} />
                            <SummaryRow label='License' value={draft?.businessInfo?.licenseNumber} />
                            <SummaryRow label='Owner' value={draft?.businessInfo?.contact?.ownerName} />
                            <SummaryRow label='Contact email' value={draft?.businessInfo?.contact?.email} />
                            <SummaryRow label='Rooms' value={draft?.guestServices?.facilities?.numberOfRooms} />
                            <SummaryRow label='Address' value={draft?.businessInfo?.contact?.address} />
                        </div>

                        <div className='mt-6 rounded-xl border border-(--border-soft) bg-(--surface-soft) px-4 py-3'>
                            <p className='text-xs font-semibold text-(--text-700)'>Selected files</p>
                            <p className='mt-2 text-sm font-medium text-(--text-500)'>
                                Legal documents: {files.legalDocuments?.length || 0} · Salary slips: {files.salarySlips ? '1' : '0'} · Staff handbook:{' '}
                                {files.staffHandbook ? '1' : '0'} · HR policy: {files.hrPolicy ? '1' : '0'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className='flex flex-col-reverse gap-3 rounded-2xl border border-(--border-soft) bg-(--surface-white) p-5 shadow-(--shadow-soft) sm:flex-row sm:items-center sm:justify-between'>
                <button
                    type='button'
                    onClick={handleBack}
                    disabled={stepIndex === 0 || submitting}
                    className='inline-flex items-center justify-center gap-2 rounded-xl border border-(--border-soft) bg-(--surface-white) px-4 py-3 text-sm font-semibold text-(--text-700) transition hover:border-(--brand-700) hover:text-(--brand-900) disabled:cursor-not-allowed disabled:opacity-60'
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    {stepIndex === 0 && !canProceedFromDetails ? (
                        <p className='text-xs font-semibold text-(--error-600)'>Fill all required fields to continue.</p>
                    ) : null}

                    {stepIndex < 2 ? (
                        <button
                            type='button'
                            onClick={handleNext}
                            disabled={submitting || (stepIndex === 0 && !canProceedFromDetails)}
                            className='inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-700) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            Next
                            <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={() => onSubmit({ draft: draft || {}, files })}
                            disabled={submitting}
                            className='inline-flex items-center justify-center gap-2 rounded-xl bg-(--brand-700) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            {submitting ? 'Submitting...' : submitLabel}
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HotelApplicationWizard
