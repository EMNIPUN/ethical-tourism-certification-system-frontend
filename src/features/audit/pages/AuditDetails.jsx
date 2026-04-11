import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  FileText, 
  ClipboardCheck, 
  MapPin, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Hotel
} from 'lucide-react'
import { fetchAuditById, clearSelectedAudit } from '../store/auditSlice'
import { auditApi } from '../api/auditApi'

// Sub-components for tabs
import OverviewTab from '../components/OverviewTab'
import SectionsTab from '../components/SectionsTab'
import ComplianceTab from '../components/ComplianceTab'
import SiteVisitTab from '../components/SiteVisitTab'
import DocumentsTab from '../components/DocumentsTab'
import AdvisorTab from '../components/AdvisorTab'

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'sections', label: 'Assessment', icon: ClipboardCheck },
  { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
  { id: 'site_visit', label: 'Site Visit', icon: MapPin },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'advisor', label: 'AI Advisor', icon: MessageSquare },
]

function AuditDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedAudit, status, error } = useSelector((state) => state.audit)
  const { token } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    dispatch(fetchAuditById(id))
    return () => dispatch(clearSelectedAudit())
  }, [dispatch, id])

  if (status === 'loading' && !selectedAudit) return (
    <div className='flex h-64 items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-200)] border-t-[var(--brand-600)]'></div>
    </div>
  )

  if (error || !selectedAudit) return (
    <div className='flex h-64 flex-col items-center justify-center space-y-4'>
      <AlertCircle size={48} className='text-rose-500' />
      <p className='text-lg font-bold text-[#1f2b49]'>{error || 'Audit not found'}</p>
      <button onClick={() => navigate('/audit')} className='btn-subtle'>Go Back</button>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab audit={selectedAudit} token={token} onRefresh={() => dispatch(fetchAuditById(id))} />
      case 'sections': return <SectionsTab audit={selectedAudit} token={token} onRefresh={() => dispatch(fetchAuditById(id))} />
      case 'compliance': return <ComplianceTab audit={selectedAudit} token={token} onRefresh={() => dispatch(fetchAuditById(id))} />
      case 'site_visit': return <SiteVisitTab audit={selectedAudit} token={token} onRefresh={() => dispatch(fetchAuditById(id))} />
      case 'documents': return <DocumentsTab audit={selectedAudit} token={token} onRefresh={() => dispatch(fetchAuditById(id))} />
      case 'advisor': return <AdvisorTab audit={selectedAudit} token={token} />
      default: return <OverviewTab audit={selectedAudit} token={token} />
    }
  }

  return (
    <div className='fade-up space-y-6'>
      {/* HEADER PANEL */}
      <div className='glass-panel flex items-center justify-between rounded-3xl p-6 shadow-sm'>
        <div className='flex items-center gap-5'>
          <button 
            onClick={() => navigate('/admin/audit-management')}
            className='flex h-12 w-12 items-center justify-center rounded-xl border border-[#e3ebf7] bg-white text-[#5f6f8c] transition hover:bg-[#f4f7fc] hover:text-[#1f2b49]'
          >
            <ArrowLeft size={20} />
          </button>
          <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8faff] to-[#f0f4ff] shadow-inner'>
             <Hotel size={28} className='text-[var(--brand-600)]' />
          </div>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold text-[#1f2b49]'>{selectedAudit.hotel?.businessInfo?.name}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                selectedAudit.auditStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedAudit.auditStatus?.replace('_', ' ')}
              </span>
            </div>
            <p className='mt-1 text-xs font-bold text-[#8d98af]'>Audit Reference: {selectedAudit._id.slice(-12).toUpperCase()}</p>
          </div>
        </div>
        
        <div className='hidden md:flex items-center gap-6'>
          <div className='text-right'>
            <p className='text-[10px] font-black uppercase tracking-[0.1em] text-[#8d98af]'>Score Progress</p>
            <div className='mt-1 flex items-center gap-3'>
              <div className='h-2 w-32 overflow-hidden rounded-full bg-[#f0f4ff]'>
                <div 
                  className='h-full bg-[var(--brand-600)]' 
                  style={{ width: `${selectedAudit.overallScore || 0}%` }}
                />
              </div>
              <span className='text-lg font-black text-[#1f2b49]'>{Math.round(selectedAudit.overallScore || 0)}%</span>
            </div>
          </div>
          <button className='btn-primary flex h-11 items-center gap-2 px-6'>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION BAR */}
      <div className='glass-panel flex overflow-x-auto rounded-3xl p-1.5 shadow-sm scrollbar-hide'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-4 transition-all duration-300 ${
                isActive 
                  ? 'bg-[var(--brand-600)] text-white shadow-lg shadow-[var(--brand-600)]/20' 
                  : 'text-[#5f6f8c] hover:bg-[#f4f7fc] hover:text-[var(--brand-700)]'
              }`}
            >
              <Icon size={18} />
              <span className='text-xs font-extrabold uppercase tracking-widest'>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB SPECIFIC CONTENT */}
      <div className='workspace-content min-h-[600px]'>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default AuditDetails
