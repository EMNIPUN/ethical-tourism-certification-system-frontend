import { useState } from 'react'
import { FileText, Upload, Plus, Trash2, Eye, Loader2, Database } from 'lucide-react'
import { auditApi } from '../api/auditApi'

function DocumentsTab({ audit, token, onRefresh }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('fileName', file.name)
    formData.append('fileType', file.type || 'application/pdf')
    formData.append('fileUrl', 'https://placeholder-url.com/' + file.name) // In real app, upload to S3 first
    formData.append('description', 'Uploaded during audit assessment')

    try {
      await auditApi.addAttachment(audit._id, {
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileUrl:  'https://placeholder-url.com/' + file.name,
        description: 'Audit attachment'
      }, token)
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessDocuments = async () => {
    if (!confirm('This will process all hotel documents into the vector database for AI analysis. Proceed?')) return
    setIsProcessing(true)
    try {
      // Create empty FormData as per backend expectance (or we could pass new files)
      const emptyFormData = new FormData()
      await auditApi.processDocuments(audit.hotel?._id, emptyFormData, token)
      alert('Documents processed successfully!')
    } catch (err) {
      alert(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-[#1f2b49]'>Audit Documentation</h2>
          <p className='text-xs text-[#5f6f8c]'>Manage evidence attachments and process data for AI-assisted review.</p>
        </div>
        <div className='flex gap-3'>
          <button 
            onClick={handleProcessDocuments}
            disabled={isProcessing}
            className='btn-subtle flex items-center gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          >
            {isProcessing ? <Loader2 size={14} className='animate-spin' /> : <Database size={14} />}
            Process for AI
          </button>
          <label className='btn-primary flex cursor-pointer items-center gap-2'>
            {isUploading ? <Loader2 size={14} className='animate-spin' /> : <Upload size={14} />}
             Upload Evidence
            <input type='file' className='hidden' onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {audit.attachments?.map((doc, i) => (
          <div key={i} className='group relative rounded-2xl border border-[#eef2f8] bg-white p-4 transition hover:border-[var(--brand-300)] hover:shadow-md'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f7fc] text-[#5f6f8c] group-hover:bg-[var(--brand-50)] group-hover:text-[var(--brand-700)]'>
                <FileText size={20} />
              </div>
              <div className='flex-1 overflow-hidden'>
                <p className='truncate text-sm font-bold text-[#1f2b49]'>{doc.fileName}</p>
                <p className='text-[10px] text-[#8d98af]'>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className='mt-4 flex gap-2'>
              <a 
                href={doc.fileUrl} 
                target='_blank' 
                rel='noreferrer'
                className='flex flex-1 items-center justify-center rounded-lg bg-[#f9fbff] py-1.5 text-[11px] font-bold text-[#5f6f8c] hover:bg-[#eff4ff] hover:text-[var(--brand-700)]'
              >
                <Eye size={14} className='mr-1.5' /> View
              </a>
              <button className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf2f2] text-rose-500 hover:bg-rose-500 hover:text-white'>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {(!audit.attachments || audit.attachments.length === 0) && (
          <div className='col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#eef2f8] py-16'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f7fc] text-[#cfd8e6]'>
              <FileText size={32} />
            </div>
            <p className='mt-5 text-sm font-bold text-[#8d98af]'>No evidence documents uploaded.</p>
            <p className='mt-1 text-xs text-[#b0bbcf]'>Upload PDF or DOCX files to support your assessment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentsTab
