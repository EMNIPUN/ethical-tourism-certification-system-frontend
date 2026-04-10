import { FileText, Image, UploadCloud, X } from 'lucide-react'
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
    return `${unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`
}

function getFileTypeLabel(name) {
    const ext = (name || '').split('.').pop().toLowerCase()
    if (ext === 'pdf') return { label: 'PDF', cls: 'ca-file-type-icon--pdf' }
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return { label: 'IMG', cls: 'ca-file-type-icon--img' }
    if (['doc', 'docx'].includes(ext)) return { label: 'DOC', cls: 'ca-file-type-icon--doc' }
    return { label: ext.toUpperCase() || 'FILE', cls: 'ca-file-type-icon--other' }
}

function FileListItem({ file, onRemove }) {
    const { label, cls } = getFileTypeLabel(file.name)
    return (
        <div className='ca-file-item'>
            <div className={`ca-file-type-icon ${cls}`}>{label}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p className='ca-file-name'>{file.name}</p>
                <p className='ca-file-size'>{formatBytes(file.size)}</p>
            </div>
            <button
                type='button'
                onClick={onRemove}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.9rem',
                    height: '1.9rem',
                    borderRadius: '0.55rem',
                    border: '1px solid rgba(207,216,230,0.8)',
                    background: 'rgba(248,250,255,0.9)',
                    color: '#8c98af',
                    cursor: 'pointer',
                    transition: 'all 160ms ease',
                    flexShrink: 0,
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(200,50,50,0.08)'
                    e.currentTarget.style.borderColor = 'rgba(200,50,50,0.3)'
                    e.currentTarget.style.color = '#c0392b'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(248,250,255,0.9)'
                    e.currentTarget.style.borderColor = 'rgba(207,216,230,0.8)'
                    e.currentTarget.style.color = '#8c98af'
                }}
            >
                <X size={13} strokeWidth={2.5} />
            </button>
        </div>
    )
}

function FileCard({ title, description, accept, multiple, files, onChange, name, icon: Icon = UploadCloud }) {
    const inputId = useId()
    const [isDragActive, setIsDragActive] = useState(false)

    const hasFiles = multiple ? (files?.length || 0) > 0 : Boolean(files)
    const selectedFiles = useMemo(() => {
        if (multiple) return Array.isArray(files) ? files : []
        return files ? [files] : []
    }, [files, multiple])

    function setFromFileList(fileList) {
        const next = Array.from(fileList || [])
        onChange(multiple ? next : (next[0] || null))
    }

    function handleRemove(fileName) {
        if (multiple) {
            onChange((selectedFiles || []).filter(f => f.name !== fileName))
        } else {
            onChange(null)
        }
    }

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true) }
    const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true) }
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false) }
    const handleDrop      = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); setFromFileList(e.dataTransfer.files) }

    return (
        <div className='ca-section-card'>
            {/* Card header */}
            <div className='ca-section-header'>
                <div className='ca-section-icon'>
                    <Icon size={18} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                    <p className='ca-section-title'>{title}</p>
                    <p className='ca-section-desc'>{description}</p>
                </div>
                {hasFiles ? (
                    <span
                        style={{
                            background: 'rgba(31,108,68,0.09)',
                            border: '1px solid rgba(31,108,68,0.22)',
                            color: '#1f6c44',
                            borderRadius: '999px',
                            padding: '0.22rem 0.7rem',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        {multiple ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}` : '1 file'}
                    </span>
                ) : null}
            </div>

            <div className='ca-section-body' style={{ display: 'grid', gap: '1rem' }}>
                {/* Drop zone */}
                <label
                    htmlFor={inputId}
                    className={`ca-upload-zone${isDragActive ? ' ca-upload-zone--dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id={inputId}
                        type='file'
                        name={name}
                        accept={accept}
                        multiple={multiple}
                        className='sr-only'
                        style={{ display: 'none' }}
                        onChange={(e) => setFromFileList(e.target.files)}
                    />
                    <div className='ca-upload-icon-wrap'>
                        <UploadCloud size={20} strokeWidth={1.8} />
                    </div>
                    <p className='ca-upload-title'>
                        {isDragActive ? 'Drop files here' : 'Drag & drop or click to browse'}
                    </p>
                    <p className='ca-upload-hint'>
                        PDF · JPG · PNG — Max 15 MB each{multiple ? ` · Up to 10 files` : ''}
                    </p>
                </label>

                {/* File list */}
                {hasFiles ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {selectedFiles.map((file) => (
                            <FileListItem
                                key={file.name}
                                file={file}
                                onRemove={() => handleRemove(file.name)}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

function EvidenceUploadFields({ files, onFilesChange }) {
    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Hero info banner */}
            <div
                className='ca-animate-up'
                style={{
                    borderRadius: '1.25rem',
                    border: '1px solid rgba(88,104,216,0.2)',
                    background: 'linear-gradient(135deg, rgba(88,104,216,0.06), rgba(88,104,216,0.02))',
                    padding: '1.1rem 1.4rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                }}
            >
                <div
                    style={{
                        width: '2.2rem',
                        height: '2.2rem',
                        borderRadius: '0.65rem',
                        background: 'rgba(88,104,216,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5868d8',
                        flexShrink: 0,
                    }}
                >
                    <FileText size={14} strokeWidth={2.2} />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 700, color: '#3a46a8' }}>
                        Supporting evidence uploads
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', fontWeight: 500, color: '#61708a', lineHeight: 1.5 }}>
                        Upload legal, compliance, and HR documents to support your application. All documents are securely stored and only reviewed by certified evaluators.
                    </p>
                </div>
            </div>

            {/* Legal documents — full width */}
            <div className='ca-animate-up-1'>
                <FileCard
                    title='Legal compliance documents'
                    description='Business registration, fire safety certificates, operating permits, and other legal documents (up to 10 files).'
                    accept='.pdf,.png,.jpg,.jpeg'
                    multiple
                    icon={FileText}
                    name='legalDocuments'
                    files={files.legalDocuments || []}
                    onChange={(selected) => onFilesChange({ ...files, legalDocuments: selected })}
                />
            </div>

            {/* Other 3 — grid */}
            <div
                className='ca-animate-up-2'
                style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
                <FileCard
                    title='Salary slips'
                    description='Evidence of fair wage compliance for all staff.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    icon={Image}
                    name='salarySlips'
                    files={files.salarySlips}
                    onChange={(selected) => onFilesChange({ ...files, salarySlips: selected })}
                />
                <FileCard
                    title='Staff handbook'
                    description='Official policies and procedures shared with all staff.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    icon={FileText}
                    name='staffHandbook'
                    files={files.staffHandbook}
                    onChange={(selected) => onFilesChange({ ...files, staffHandbook: selected })}
                />
                <FileCard
                    title='HR policy document'
                    description='Human resources policy and disciplinary procedures.'
                    accept='.pdf,.png,.jpg,.jpeg'
                    icon={FileText}
                    name='hrPolicy'
                    files={files.hrPolicy}
                    onChange={(selected) => onFilesChange({ ...files, hrPolicy: selected })}
                />
            </div>
        </div>
    )
}

export default EvidenceUploadFields
