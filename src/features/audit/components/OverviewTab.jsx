import { useState } from 'react'
import { Calendar, User, Hotel as HotelIcon, Award, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { auditApi } from '../api/auditApi'

function OverviewTab({ audit, token, onRefresh }) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [recommendation, setRecommendation] = useState(audit.recommendation || 'pending')
  const [finalComments, setFinalComments] = useState(audit.finalComments || '')

  const handleComplete = async () => {
    if (recommendation === 'pending') return alert('Please select a recommendation')
    setIsCompleting(true)
    try {
      await auditApi.completeAudit(audit._id, { recommendation, finalComments, overallScore: audit.overallScore }, token)
      onRefresh()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-4'>
          <h3 className='text-sm font-bold text-[#1f2b49]'>Audit Information</h3>
          <div className='rounded-xl border border-[#f0f4ff] bg-[#f9fbff]/50 p-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#5f6f8c] shadow-sm'>
                  <HotelIcon size={16} />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-[#8d98af]'>Hotel Name</p>
                  <p className='text-sm font-bold text-[#1f2b49]'>{audit.hotel?.businessInfo?.name || 'N/A'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#5f6f8c] shadow-sm'>
                  <User size={16} />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-[#8d98af]'>Assigned Auditor</p>
                  <p className='text-sm font-bold text-[#1f2b49]'>{audit.auditor?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#5f6f8c] shadow-sm'>
                  <Calendar size={16} />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-[#8d98af]'>Start Date</p>
                  <p className='text-sm font-bold text-[#1f2b49]'>{new Date(audit.auditStartDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#5f6f8c] shadow-sm'>
                  <Award size={16} />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-[#8d98af]'>Current Score</p>
                  <p className='text-sm font-bold text-[#1f2b49]'>{audit.overallScore || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='text-sm font-bold text-[#1f2b49]'>Final Review</h3>
          <div className='space-y-4 rounded-xl border border-[#f0f4ff] bg-[#fdfdfd] p-4 shadow-sm'>
            <div>
              <label className='text-xs font-bold text-[#5f6f8c]'>Recommendation</label>
              <select 
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                disabled={audit.auditStatus === 'completed'}
                className='form-select mt-1 text-xs'
              >
                <option value='pending'>Pending Decision</option>
                <option value='approve'>Approve Certification</option>
                <option value='conditional_approval'>Conditional Approval</option>
                <option value='reject'>Reject Certification</option>
              </select>
            </div>
            <div>
              <label className='text-xs font-bold text-[#5f6f8c]'>Final Comments</label>
              <textarea 
                value={finalComments}
                onChange={(e) => setFinalComments(e.target.value)}
                disabled={audit.auditStatus === 'completed'}
                rows='3'
                placeholder='Enter final audit summary and findings...'
                className='form-input mt-1 text-sm'
              />
            </div>
            {audit.auditStatus !== 'completed' && (
              <button 
                onClick={handleComplete}
                disabled={isCompleting}
                className='btn-primary mt-2 flex items-center justify-center gap-2 py-2 text-sm'
              >
                {isCompleting ? <Loader2 size={16} className='animate-spin' /> : <CheckCircle size={16} />}
                Complete Audit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-sm font-bold text-[#1f2b49]'>Certification Criteria</h3>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[
            { name: 'Business Info', key: 'businessInfo' },
            { name: 'Legal Docs', key: 'legalDocuments' },
            { name: 'Employee Practices', key: 'employeePractices' },
            { name: 'Sustainability', key: 'sustainability' },
            { name: 'Community', key: 'community' },
            { name: 'Guest Services', key: 'guestServices' },
          ].map((sec) => {
            const section = audit.sections ? audit.sections[sec.key] : null
            const score = audit.sectionScores ? audit.sectionScores[sec.key] : (section?.score || 0)
            const status = section?.status || 'pending'
            return (
              <div key={sec.key} className='flex items-center justify-between rounded-xl border border-[#f0f4ff] bg-white p-3 shadow-sm'>
                <div>
                  <p className='text-xs font-bold text-[#1f2b49]'>{sec.name}</p>
                  <p className='mt-1 text-[10px] font-bold uppercase text-[#8d98af]'>{status}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-extrabold text-[#1f2b49]'>{score}%</p>
                  <div className='mt-1 h-1 w-12 overflow-hidden rounded-full bg-[#eee]'>
                    <div className='h-full bg-[var(--brand-600)]' style={{ width: `${score}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
