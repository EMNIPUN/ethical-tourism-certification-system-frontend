import { UploadCloud } from 'lucide-react'
import { useId, useMemo, useState } from 'react'

function formatBytes(bytes) {
    if (typeof bytes !== 'number' || Number.isNaN(bytes)) return ''
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex += 1
    }

    const rounded = unitIndex === 0 ? String(Math.round(size)) : size.toFixed(1)
    return `${rounded} ${units[unitIndex]}`
}

function FileCard({ title, description, accept, multiple, files, onChange, name }) {
    const inputId = useId()
    const [isDragActive, setIsDragActive] = useState(false)

    const hasFiles = multiple ? (files?.length || 0) > 0 : Boolean(files)
    const selectedFiles = useMemo(() => {
        if (multiple) return Array.isArray(files) ? files : []
        return files ? [files] : []
    }, [files, multiple])

    function setFromFileList(fileList) {
        const next = Array.from(fileList || [])
        if (multiple) {
            onChange(next)
        } else {
            onChange(next[0] || null)
        }
    }

    function handleRemoveFile(fileName) {
        if (multiple) {
            onChange((selectedFiles || []).filter((file) => file.name !== fileName))
        } else {
            onChange(null)
        }
    }

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

            <div className='mt-5'>
                <label
                    htmlFor={inputId}
                    onDragEnter={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsDragActive(true)
                    }}
                    onDragOver={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsDragActive(true)
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsDragActive(false)
                    }}
                    onDrop={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        setIsDragActive(false)
                        setFromFileList(event.dataTransfer.files)
                    }}
                    className={
                        'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-7 text-center transition ' +
                        (isDragActive
                            ? 'border-(--brand-700) bg-(--surface-soft)'
                            : 'border-(--border-soft) bg-(--surface-soft) hover:border-(--brand-700)')
                    }
                >
                    <input
                        id={inputId}
                        type='file'
                        name={name}
                        accept={accept}
                        multiple={multiple}
                        className='hidden'
                        onChange={(event) => setFromFileList(event.target.files)}
                    />

                    <span className='inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-(--surface-white) text-(--brand-700) shadow-(--shadow-soft)'>
                        <UploadCloud size={20} />
                    </span>
                    <div>
                        <p className='text-sm font-bold text-(--text-950)'>Drag & drop files here</p>
                        <p className='mt-1 text-xs font-semibold text-(--text-700)'>or click to browse{multiple ? ' (up to 10)' : ''}</p>
                        <p className='mt-2 text-xs font-medium text-(--text-500)'>PDF / JPG / PNG · Max 15MB each</p>
                    </div>

                    {hasFiles ? (
                        <span className='badge-chip'>Selected: {multiple ? selectedFiles.length : '1'}</span>
                    ) : null}
                </label>
            </div>

            <div className='mt-4'>
                {hasFiles ? (
                    <ul className='space-y-2 text-sm font-medium text-(--text-700)'>
                        {selectedFiles.map((file) => (
                            <li
                                key={file.name}
                                className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-soft) bg-(--surface-soft) px-3 py-2'
                            >
                                <div className='min-w-0'>
                                    <p className='truncate text-sm font-semibold text-(--text-950)'>{file.name}</p>
                                    <p className='mt-1 text-xs font-medium text-(--text-500)'>{formatBytes(file.size)}</p>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => handleRemoveFile(file.name)}
                                    className='inline-flex items-center justify-center rounded-xl border border-(--border-soft) bg-(--surface-white) px-3 py-2 text-xs font-semibold text-(--text-700) transition hover:border-(--brand-700) hover:text-(--brand-900)'
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
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
