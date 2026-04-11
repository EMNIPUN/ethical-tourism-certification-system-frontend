import { useState } from 'react'
import { Calendar, MapPin, Users, History, Loader2, Save, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { auditApi } from '../api/auditApi'

function SiteVisitTab({ audit, token, onRefresh }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const visit = audit.siteVisit || {}
  const isScheduled = !!visit.visitDate

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    const formData = new FormData(e.target)
    try {
      if (!isScheduled) {
        await auditApi.scheduleSiteVisit(audit._id, {
          visitDate: formData.get('visitDate'),
          duration: formData.get('duration'),
          attendees: formData.get('attendees').split(',').map(s => s.trim())
        }, token)
      } else {
        await auditApi.updateSiteVisitFindings(audit._id, {
          findings: formData.get('findings'),
          attendees: formData.get('attendees').split(',').map(s => s.trim())
        }, token)
      }
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='fade-up space-y-6'>
      {/* SCHEDULED VISIT BANNER (Top Section) */}
      {isScheduled && (
        <div className='glass-panel rounded-3xl p-6 shadow-sm border border-[var(--brand-100)] bg-gradient-to-r from-white to-[var(--brand-50)]/30'>
          <div className='flex flex-wrap items-center justify-between gap-6'>
            <div className='flex items-center gap-5'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-600)] text-white shadow-lg shadow-[var(--brand-600)]/20'>
                <Calendar size={28} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                   <h3 className='text-lg font-black text-[#1f2b49]'>Site Visit Scheduled</h3>
                   <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 uppercase tracking-widest'>Active</span>
                </div>
                <p className='text-xs font-bold text-[#5f6f8c]'>Physical inspection is currently in progress or completed.</p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-8'>
              <div className='flex flex-col'>
                <span className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Inspection Date</span>
                <span className='text-sm font-bold text-[#1f2b49]'>{new Date(visit.visitDate).toLocaleDateString()} at {new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className='flex flex-col border-l border-[#eef2f8] pl-8'>
                <span className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Expected Duration</span>
                <span className='text-sm font-bold text-[#1f2b49]'>{visit.duration || 'N/A'}</span>
              </div>
              <div className='flex flex-col border-l border-[#eef2f8] pl-8'>
                <span className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Internal Assignees</span>
                <span className='text-sm font-bold text-[#1f2b49]'>{visit.attendees?.join(', ') || 'None assigned'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM SECTION */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* FINDINGS INPUT */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='glass-panel rounded-3xl p-8 border border-[#eef2f8] bg-white'>
            <div className='flex items-center gap-4 mb-6 border-b border-[#f0f4ff] pb-5'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f7fc] text-[#5f6f8c]'>
                <MapPin size={22} />
              </div>
              <div>
                <h2 className='text-sm font-black uppercase tracking-widest text-[#1f2b49]'>Observations & Findings</h2>
                <p className='text-[11px] font-bold text-[#8d98af]'>Document critical findings discovered during the site visit.</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className='space-y-6'>
              {/* If NOT scheduled, show scheduling fields at TOP of form */}
              {!isScheduled && (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-2xl bg-[#f9fbff] p-6 border border-[#f0f4ff]'>
                  <div>
                    <label className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Visit Date</label>
                    <input 
                      type='datetime-local' 
                      name='visitDate'
                      required
                      className='form-input mt-2 text-xs font-bold rounded-xl bg-white h-11'
                    />
                  </div>
                  <div>
                    <label className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Assigned Auditors</label>
                    <input 
                      type='text' 
                      name='attendees'
                      placeholder='Comma separated names'
                      className='form-input mt-2 text-xs font-bold rounded-xl bg-white h-11'
                    />
                  </div>
                  <div className='sm:col-span-2'>
                    <label className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Visit Duration</label>
                    <input 
                      type='text' 
                      name='duration'
                      placeholder='e.g., 2 hours, Full Day'
                      className='form-input mt-2 text-xs font-bold rounded-xl bg-white h-11'
                    />
                  </div>
                </div>
              )}

              {/* ALWAYS SHOW FINDINGS AND ATTENDEES (if already scheduled) */}
              {isScheduled && (
                <div className='mb-4'>
                   <label className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Update Assignees</label>
                   <input 
                      type='text' 
                      name='attendees'
                      defaultValue={visit.attendees?.join(', ')}
                      placeholder='Comma separated names'
                      className='form-input mt-2 text-xs font-bold rounded-xl bg-[#f8faff] h-11 border-[#dde4f1]'
                    />
                </div>
              )}

              <div>
                <label className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Detailed inspection report</label>
                <textarea 
                  name='findings'
                  rows='10'
                  defaultValue={visit.findings || ''}
                  placeholder='Record site conditions, staff interactions, and physical evidence...'
                  className='form-input mt-2 text-xs font-bold rounded-2xl bg-[#f8faff] border-[#dde4f1] p-4 resize-none'
                />
              </div>

              <div className='flex justify-end'>
                <button 
                  type='submit' 
                  disabled={isUpdating}
                  className='btn-primary h-14 px-10 flex items-center gap-3 rounded-2xl shadow-xl shadow-[var(--brand-600)]/15 active:scale-95 transition-all font-black uppercase text-xs tracking-widest'
                >
                  {isUpdating ? <Loader2 size={18} className='animate-spin' /> : <Save size={18} />}
                  {isScheduled ? 'Commit Findings' : 'Finalize Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIDE CONTEXT PANEL */}
        <div className='space-y-6'>
          <div className='glass-panel rounded-3xl p-6 border border-[#eef2f8] bg-white'>
            <h3 className='text-[11px] font-black uppercase tracking-widest text-[#1f2b49] mb-4'>Compliance Guidelines</h3>
            <div className='space-y-4'>
               {[
                 'Verify waste segregation units physically.',
                 'Inspect staff restroom facilities & conditions.',
                 'Validate fire emergency exit accessibility.',
                 'Cross-reference local employee presence.'
               ].map((tip, i) => (
                 <div key={i} className='flex gap-3'>
                    <CheckCircle2 size={14} className='mt-0.5 text-emerald-500 shrink-0' />
                    <p className='text-xs font-medium text-[#5f6f8c] leading-relaxed'>{tip}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className='glass-panel rounded-3xl p-6 border border-amber-100 bg-amber-50/30'>
            <div className='flex items-center gap-3 mb-3 text-amber-700'>
               <AlertCircle size={18} />
               <h4 className='text-xs font-black uppercase tracking-wider'>Notice</h4>
            </div>
            <p className='text-[11px] font-bold text-amber-800 leading-relaxed'>
              Ensuring the visit date is accurate is critical for audit logging. Changes to the visit date require administrative approval once saved.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SiteVisitTab
