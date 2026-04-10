import { UploadCloud } from 'lucide-react'

function FileCard({ title, description, accept, multiple, files, onChange, name }) {
    const hasFiles = multiple ? (files?.length || 0) > 0 : Boolean(files)

    return (
        <div className='rounded-2xl border border-(--border-soft) bg-(--surface-white) p-6 shadow-(--shadow-soft)'>
            <div className='flex items-start justify-between gap-4'>
                <div>
                    <h3 className='text-base font-bold text-(--text-950)'>{title}</h3>
                    <p className='mt-1 text-sm font-medium text-(--text-700)'>{description}</p>
                </div>
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--surface-soft) text-(--brand-700)'>
                    <UploadCloud size={18} />
                </span>
            </div>

            <div className='mt-5 flex flex-wrap items-center gap-3'>
                <label className='inline-flex cursor-pointer items-center justify-center rounded-xl bg-(--brand-700) px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105'>
                    <input
                        type='file'
                        name={name}
                        accept={accept}
                        multiple={multiple}
                        className='hidden'
                        onChange={(event) => {
                            if (multiple) {
                                onChange(Array.from(event.target.files || []))
                            } else {
                                onChange(event.target.files?.[0] || null)
                            }
                        }}
                    />
                    Choose file{multiple ? 's' : ''}
                </label>

                <span className='text-xs font-semibold text-(--text-500)'>Max 15MB each</span>
            </div>

            <div className='mt-4'>
                {hasFiles ? (
                    <ul className='space-y-2 text-sm font-medium text-(--text-700)'>
                        {multiple
                            ? files.map((file) => (
                                <li key={file.name} className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-3 py-2'>
                                    {file.name}
                                </li>
                            ))
                            : (
                                <li className='rounded-xl border border-(--border-soft) bg-(--surface-soft) px-3 py-2'>
                                    {files.name}
                                </li>
                            )}
                    </ul>
                ) : (
                    <p className='text-sm font-medium text-(--text-500)'>No files selected.</p>
                )}
            </div>
        </div>
    )
}

function EvidenceUploadFields({ files, onFilesChange }) {
    return (
        <div className='grid gap-6'>
            <FileCard
                title='Legal compliance documents'
                description='Upload up to 10 supporting legal documents (business registration, fire safety, etc.).'
                accept='.pdf,.png,.jpg,.jpeg'
                multiple
                name='legalDocuments'
                files={files.legalDocuments || []}
                onChange={(selected) => onFilesChange({ ...files, legalDocuments: selected })}
            />

            <div className='grid gap-6 md:grid-cols-3'>
                <FileCard
                    title='Salary slips'
                    description='Evidence of wage compliance.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    name='salarySlips'
                    files={files.salarySlips}
                    onChange={(selected) => onFilesChange({ ...files, salarySlips: selected })}
                />
                <FileCard
                    title='Staff handbook'
                    description='Policies shared with staff.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    name='staffHandbook'
                    files={files.staffHandbook}
                    onChange={(selected) => onFilesChange({ ...files, staffHandbook: selected })}
                />
                <FileCard
                    title='HR policy'
                    description='Official HR policy documents.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    name='hrPolicy'
                    files={files.hrPolicy}
                    onChange={(selected) => onFilesChange({ ...files, hrPolicy: selected })}
                />
            </div>
        </div>
    )
}

export default EvidenceUploadFields
