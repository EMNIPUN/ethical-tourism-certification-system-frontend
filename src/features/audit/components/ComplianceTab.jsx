import { useState } from 'react'
import { Plus, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { auditApi } from '../api/auditApi'

function ComplianceTab({ audit, token, onRefresh }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    try {
      await auditApi.addComplianceCheck(audit._id, {
        category: formData.get('category'),
        item: formData.get('item'),
        compliant: formData.get('compliant') === 'true',
        comment: formData.get('comment')
      }, token)
      onRefresh()
      setIsAdding(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-[#1f2b49]'>Compliance Checklist</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className='btn-subtle flex items-center gap-2 text-xs'
        >
          <Plus size={14} />
          {isAdding ? 'Cancel' : 'Add Check Item'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCheck} className='rounded-xl border border-[#f0f4ff] bg-[#f9fbff]/50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <label className='text-xs font-bold text-[#5f6f8c]'>Category</label>
              <input name='category' required className='form-input mt-1 text-sm' placeholder='e.g., Labor Rights' />
            </div>
            <div>
              <label className='text-xs font-bold text-[#5f6f8c]'>Status</label>
              <select name='compliant' className='form-select mt-1 text-sm'>
                <option value='true'>Compliant</option>
                <option value='false'>Non-Compliant</option>
              </select>
            </div>
          </div>
          <div>
            <label className='text-xs font-bold text-[#5f6f8c]'>Item / Requirement</label>
            <input name='item' required className='form-input mt-1 text-sm' placeholder='e.g., Fair wage documentation' />
          </div>
          <div>
            <label className='text-xs font-bold text-[#5f6f8c]'>Observation / Evidence</label>
            <textarea name='comment' rows='2' className='form-input mt-1 text-sm' />
          </div>
          <button type='submit' disabled={loading} className='btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm'>
            {loading ? <Loader2 size={16} className='animate-spin' /> : <Plus size={16} />}
            Add Compliance Record
          </button>
        </form>
      )}

      <div className='space-y-3'>
        {audit.complianceChecks?.map((check, i) => (
          <div key={i} className='group rounded-2xl border border-[#eef2f8] bg-white p-4 shadow-sm transition hover:border-[var(--brand-300)]'>
            <div className='flex items-start justify-between'>
              <div className='flex gap-4'>
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  check.compliant ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {check.compliant ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-[#8d98af]'>{check.category}</span>
                    <span className={`text-[10px] font-bold ${check.compliant ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {check.compliant ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <p className='mt-1 text-sm font-bold text-[#1f2b49]'>{check.item}</p>
                  {check.comment && <p className='mt-1.5 text-xs text-[#5f6f8c]'>{check.comment}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!audit.complianceChecks || audit.complianceChecks.length === 0) && (
          <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#eef2f8] py-12'>
            <AlertCircle size={32} className='text-[#cfd8e6]' />
            <p className='mt-4 text-xs font-bold text-[#8d98af]'>No compliance checks recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceTab
