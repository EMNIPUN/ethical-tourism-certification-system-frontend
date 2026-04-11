import { useState } from 'react'
import { CheckSquare, AlertTriangle, FileCheck2, Loader2, ChevronDown, ChevronUp, Info, FileText, Globe, Users, Leaf, Heart, Monitor, Save, ExternalLink, ShieldCheck, Zap, Droplets, Trash, GraduationCap, HandHelping, Scale, Hotel, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { auditApi } from '../api/auditApi'

const sectionLabels = {
  businessInfo: 'Business Info',
  legalDocuments: 'Legal Docs',
  employeePractices: 'Employee Practices',
  sustainability: 'Sustainability',
  community: 'Community',
  guestServices: 'Guest Services',
}

const SECTION_ORDER = [
  'businessInfo',
  'legalDocuments',
  'employeePractices',
  'sustainability',
  'community',
  'guestServices'
]

function HotelDataView({ section, data }) {
  if (!data) return <p className='text-xs italic text-[#8d98af]'>No data provided for this section.</p>

  const renderItem = (label, value) => {
    if (value === undefined || value === null) return null
    return (
      <div className='flex flex-col border-b border-[#f0f4ff] pb-3 last:border-0 last:pb-0'>
        <span className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>{label}</span>
        <span className='mt-1 text-sm font-semibold text-[#1f2b49]'>
           {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : (Array.isArray(value) ? value.join(', ') : value)}
        </span>
      </div>
    )
  }

  const renderDate = (dateObj) => {
    if (!dateObj) return 'N/A'
    const date = dateObj.$date ? new Date(dateObj.$date) : new Date(dateObj)
    return date.toLocaleDateString()
  }

  switch (section) {
    case 'businessInfo':
      return (
        <div className='space-y-4'>
          {renderItem('Business Name', data.name)}
          {renderItem('Registration Number', data.registrationNumber)}
          {renderItem('License Number', data.licenseNumber)}
          {renderItem('Business Type', data.businessType)}
          <h4 className='mt-4 text-[10px] font-black uppercase text-[var(--brand-700)]'>Contact Details</h4>
          {renderItem('Owner Name', data.contact?.ownerName)}
          {renderItem('Phone', data.contact?.phone)}
          {renderItem('Email', data.contact?.email)}
          {renderItem('Address', data.contact?.address)}
        </div>
      )
    case 'legalDocuments':
      return (
        <div className='space-y-4'>
          {data.map((doc, i) => (
             <div key={i} className='rounded-2xl border border-[#eef2f8] bg-white p-4 shadow-sm space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)]'>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-[#1f2b49]'>{doc.documentName}</p>
                      <p className='text-[10px] font-bold text-[#8d98af] uppercase'>{doc.type || 'Legal Document'}</p>
                    </div>
                  </div>
                  {doc.fileUrl && (
                    <a href={doc.fileUrl} target='_blank' rel='noreferrer' className='text-[var(--brand-600)] hover:text-[var(--brand-800)]'>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4 text-[10px]'>
                   <div>
                     <span className='block font-black text-[#8d98af] uppercase tracking-wider'>Issued Date</span>
                     <span className='font-bold text-[#1f2b49]'>{renderDate(doc.issueDate)}</span>
                   </div>
                   <div>
                     <span className='block font-black text-[#8d98af] uppercase tracking-wider'>Expiry Date</span>
                     <span className='font-bold text-[#1f2b49]'>{renderDate(doc.expiryDate)}</span>
                   </div>
                </div>
                <div className='border-t border-[#f0f4ff] pt-2'>
                   <span className='block font-black text-[#8d98af] uppercase tracking-wider text-[9px]'>Issuing Authority</span>
                   <span className='text-xs font-bold text-[#1f2b49]'>{doc.issuingAuthority || 'N/A'}</span>
                </div>
             </div>
          ))}
          {(!data || data.length === 0) && <p className='text-xs italic text-[#8d98af]'>No legal documents provided.</p>}
        </div>
      )
    case 'employeePractices':
      return (
        <div className='space-y-5'>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Users size={14} /> Workforce Breakdown
            </h4>
            <div className='grid grid-cols-2 gap-x-6'>
              {renderItem('Total Employees', data.workforce?.totalEmployees)}
              {renderItem('Permanent Staff', data.workforce?.permanentStaff)}
              {renderItem('Temporary Staff', data.workforce?.temporaryStaff)}
              {renderItem('Female Ratio', data.workforce?.femaleEmployeesPercentage + '%')}
              {renderItem('Local Ratio', data.workforce?.localEmployeesPercentage + '%')}
            </div>
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Scale size={14} /> Worker Rights & Policies
            </h4>
            {renderItem('Min Wage Compliance', data.workerRights?.minimumWageCompliance)}
            {renderItem('Overtime Policy', data.workerRights?.overtimePolicy)}
            {renderItem('Working Hours', data.workerRights?.workingHoursPolicy)}
            {renderItem('Leave Policy', data.workerRights?.leavePolicy)}
            {renderItem('Health Insurance', data.workerRights?.healthInsuranceProvided)}
            {renderItem('Union/Committee', data.workerRights?.unionWorkerCommittee)}
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <ShieldCheck size={14} /> Evidence Links
            </h4>
            <div className='space-y-2'>
               {data.evidence?.salarySlipsUrl && (
                 <a href={data.evidence.salarySlipsUrl} className='flex items-center justify-between text-xs font-bold text-[var(--brand-600)] bg-[#f8faff] p-2 rounded-lg border border-[#eef2f8]'>
                   Salary Slips Repository <ExternalLink size={14} />
                 </a>
               )}
               {data.evidence?.staffHandbookUrl && (
                 <a href={data.evidence.staffHandbookUrl} className='flex items-center justify-between text-xs font-bold text-[var(--brand-600)] bg-[#f8faff] p-2 rounded-lg border border-[#eef2f8]'>
                   Staff Handbook <ExternalLink size={14} />
                 </a>
               )}
               {data.evidence?.hrPolicyUrl && (
                 <a href={data.evidence.hrPolicyUrl} className='flex items-center justify-between text-xs font-bold text-[var(--brand-600)] bg-[#f8faff] p-2 rounded-lg border border-[#eef2f8]'>
                   HR Policy Document <ExternalLink size={14} />
                 </a>
               )}
            </div>
          </div>
        </div>
      )
    case 'sustainability':
      return (
        <div className='space-y-5'>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Zap size={14} /> Resource Management
            </h4>
            <div className='grid grid-cols-2 gap-x-6'>
              {renderItem('Monthly Water', data.resourceUsage?.monthlyWaterUsage + ' units')}
              {renderItem('Monthly Power', data.resourceUsage?.monthlyElectricityUsage + ' kWh')}
              {renderItem('Fuel Usage', data.resourceUsage?.fuelUsage + ' units')}
              {renderItem('Renewable Energy', data.resourceUsage?.renewableEnergyPercentage + '%')}
            </div>
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Trash size={14} /> Waste & Conservation
            </h4>
            {renderItem('Waste Segregation', data.wasteManagement?.wasteSegregation)}
            {renderItem('Recycling Program', data.wasteManagement?.recyclingProgram)}
            {renderItem('Composting', data.wasteManagement?.composting)}
            {renderItem('Plastic Reduction', data.wasteManagement?.plasticReductionPolicy)}
            <div className='grid grid-cols-2 mt-4'>
              {renderItem('Water Saving', data.conservation?.waterSavingDevices)}
              {renderItem('Efficient Light', data.conservation?.energyEfficientLighting)}
              {renderItem('Rainwater Harvest', data.conservation?.rainwaterHarvesting)}
              {renderItem('Green Landscape', data.conservation?.greenLandscaping)}
            </div>
          </div>
          {data.certifications && data.certifications.length > 0 && (
            <div>
              <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3'>Active Certifications</h4>
              <div className='space-y-2'>
                {data.certifications.map((cert, i) => (
                  <div key={i} className='p-3 bg-emerald-50 border border-emerald-100 rounded-xl'>
                    <p className='text-xs font-bold text-emerald-900'>{cert.name}</p>
                    <p className='text-[10px] text-emerald-700 mt-1 uppercase font-bold'>Expires: {renderDate(cert.expiryDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    case 'community':
      return (
        <div className='space-y-5'>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Heart size={14} /> Local Support & Philanthropy
            </h4>
            <div className='grid grid-cols-2 gap-x-6'>
              {renderItem('Local Suppliers', data.localSupport?.localSupplierPercentage + '%')}
              {renderItem('Local Food Usage', data.localSupport?.localFoodUsagePercentage + '%')}
              {renderItem('Handicraft Promotion', data.localSupport?.handicraftPromotion)}
              {renderItem('Local Guides', data.localSupport?.localTourGuides)}
            </div>
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <HandHelping size={14} /> CSR & Training
            </h4>
            {renderItem('CSR Projects', data.projects?.csrProjects)}
            {renderItem('Training Programs', data.projects?.trainingPrograms)}
            {renderItem('Scholarship Fund', data.projects?.scholarshipPrograms)}
            {renderItem('Donations', data.projects?.donations)}
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Globe size={14} /> Cultural Protection
            </h4>
            {renderItem('Cultural Training', data.culturalProtection?.culturalAwarenessTraining)}
            {renderItem('Heritage Policy', data.culturalProtection?.heritageProtectionPolicy)}
          </div>
        </div>
      )
    case 'guestServices':
      return (
        <div className='space-y-5'>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Hotel size={14} /> Facilities & Capacity
            </h4>
            {renderItem('Total Rooms', data.facilities?.numberOfRooms)}
            {renderItem('Room Types', data.facilities?.roomTypes)}
            {renderItem('Max Capacity', data.facilities?.maxCapacity)}
            {renderItem('Accessibility', data.facilities?.accessibilityFeatures)}
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <Monitor size={14} /> Experience & Feedback
            </h4>
            {renderItem('Guest Rating', data.experience?.averageRating + ' / 5')}
            {renderItem('Complaint Policy', data.experience?.complaintHandlingPolicy)}
            {renderItem('Feedback System', data.experience?.feedbackSystem)}
          </div>
          <div>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[var(--brand-700)] mb-3 flex items-center gap-2'>
               <ShieldCheck size={14} /> Safety Measures
            </h4>
            <div className='grid grid-cols-2'>
              {renderItem('CCTV Coverage', data.safety?.cctv)}
              {renderItem('Emergency Exits', data.safety?.emergencyExits)}
              {renderItem('First Aid Kits', data.safety?.firstAidKits)}
              {renderItem('Disaster Plan', data.safety?.disasterPlan)}
            </div>
          </div>
        </div>
      )
    default:
      return <p className='text-xs italic text-[#8d98af]'>No details available.</p>
  }
}

function Toast({ type = 'success', title, message, onClose }) {
  const configs = {
    success: {
      bg: 'bg-[#ecfdf3] border-[#d1fadf]',
      iconBg: 'bg-[#d1fadf] text-[#039855]',
      icon: CheckCircle2,
      titleColor: 'text-[#067647]',
      msgColor: 'text-[#067647]',
      accent: 'Success!'
    },
    warning: {
      bg: 'bg-[#fffbeb] border-[#fef3c7]',
      iconBg: 'bg-[#fef3c7] text-[#d97706]',
      icon: AlertTriangle,
      titleColor: 'text-[#92400e]',
      msgColor: 'text-[#b45309]',
      accent: 'Warning!'
    },
    error: {
      bg: 'bg-[#fff1f3] border-[#ffe4e6]',
      iconBg: 'bg-[#ffe4e6] text-[#e11d48]',
      icon: AlertCircle,
      titleColor: 'text-[#9f1239]',
      msgColor: 'text-[#be123c]',
      accent: 'Error!'
    }
  }

  const config = configs[type] || configs.success
  const Icon = config.icon

  return (
    <div className={`fixed top-8 right-8 z-[100] flex w-80 animate-in fade-in slide-in-from-top-4 duration-300 rounded-2xl border ${config.bg} p-4 shadow-xl`}>
      <div className='flex gap-3'>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}>
          <Icon size={20} />
        </div>
        <div className='flex-1 pr-6'>
          <h4 className={`text-sm font-bold ${config.titleColor}`}>{title || config.accent}</h4>
          <p className={`mt-1 text-xs font-medium opacity-90 ${config.msgColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`absolute top-4 right-4 ${config.titleColor} opacity-40 hover:opacity-100 transition`}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function SectionsTab({ audit, token, onRefresh }) {
  const [activeSection, setActiveSection] = useState('businessInfo')
  const [isUpdating, setIsUpdating] = useState(false)
  const [toast, setToast] = useState(null)
  
  const currentSection = audit.sections ? audit.sections[activeSection] : null
  const hotelData = audit.hotel ? audit.hotel[activeSection] : null

  const handleUpdate = async (status, score, comment) => {
    setIsUpdating(true)
    try {
      await auditApi.reviewSection(audit._id, { sectionName: activeSection, status, score, comment }, token)
      
      // Show brand-aligned success toast
      setToast({
        type: 'success',
        title: 'Successfully completed!',
        message: 'Your changes saved'
      })
      setTimeout(() => setToast(null), 4000)

      // Find next section
      const currentIndex = SECTION_ORDER.indexOf(activeSection)
      const nextSection = SECTION_ORDER[currentIndex + 1]

      if (nextSection) {
        setActiveSection(nextSection)
        onRefresh()
      } else {
        onRefresh()
      }
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message
      })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='space-y-6 relative'>
      {/* Dynamic Notifications */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* SECTIONS MENU - HORIZONTAL */}
      <div className='glass-panel flex gap-2 overflow-x-auto p-1.5 scrollbar-hide rounded-2xl'>
        {SECTION_ORDER.map((key) => {
          const section = audit.sections ? audit.sections[key] : null
          const isActive = activeSection === key
          const label = sectionLabels[key]
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-[var(--brand-600)] text-white shadow-md' 
                  : 'text-[#5f6f8c] hover:bg-[#f4f7fc]'
              }`}
            >
              {label}
              {section?.status === 'approved' && <FileCheck2 size={12} className={isActive ? 'text-white' : 'text-emerald-500'} />}
            </button>
          )
        })}
      </div>

      {/* SPLIT VIEW CONTENT */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        
        {/* LEFT: HOTEL PROVIDED INFORMATION */}
        <div className='glass-panel rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col bg-white border border-[#eef2f8]'>
          <div className='bg-[#f9fbff] px-6 py-4 border-b border-[#f0f4ff] flex items-center justify-between'>
            <h3 className='text-xs font-black uppercase tracking-[0.15em] text-[#1f2b49] flex items-center gap-2'>
              <Info size={16} className='text-[var(--brand-600)]' />
              Hotel Submission
            </h3>
            <span className='text-[9px] font-black text-[var(--brand-600)] uppercase bg-white px-3 py-1 rounded-full shadow-sm'>Archive Data</span>
          </div>
          <div className='flex-1 p-6 overflow-y-auto app-scrollbar max-h-[600px]'>
             <HotelDataView section={activeSection} data={hotelData} />
          </div>
        </div>

        {/* RIGHT: AUDITOR REVIEW FORM */}
        <div className='glass-panel rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col bg-white border border-[#eef2f8]'>
          <div className='bg-[#f9fbff] px-6 py-4 border-b border-[#f0f4ff] flex items-center justify-between'>
            <h3 className='text-xs font-black uppercase tracking-[0.15em] text-[#1f2b49] flex items-center gap-2'>
              <CheckSquare size={16} className='text-[var(--brand-600)]' />
              Audit Verification
            </h3>
             <span className='text-[9px] font-black text-amber-600 uppercase bg-white px-3 py-1 rounded-full shadow-sm'>In Review</span>
          </div>
          
          <div className='flex-1 p-6'>
            <form 
              key={activeSection} // Resets form on section change
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                handleUpdate(
                  formData.get('status'),
                  Number(formData.get('score')),
                  formData.get('comment')
                )
              }}
              className='space-y-6'
            >
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='text-[10px] font-black uppercase tracking-widest text-[#8d98af] ml-1'>Review Status</label>
                  <select 
                    name='status'
                    defaultValue={currentSection?.status || 'pending'}
                    className='form-select mt-2 text-xs font-black rounded-2xl bg-[#f8faff] border-[#dde4f1] h-12 px-4 shadow-sm focus:ring-4 focus:ring-[var(--brand-600)]/10 transition'
                  >
                    <option value='pending'>⏳ Pending</option>
                    <option value='approved'>✅ Approved</option>
                    <option value='needs_revision'>🔁 Revision</option>
                    <option value='rejected'>❌ Rejected</option>
                  </select>
                </div>
                <div>
                  <label className='text-[10px] font-black uppercase tracking-widest text-[#8d98af] ml-1'>Category Score</label>
                  <div className='relative'>
                    <input 
                      type='number' 
                      name='score'
                      min='0' 
                      max='100'
                      defaultValue={audit.sectionScores ? audit.sectionScores[activeSection] : (currentSection?.score || 0)}
                      className='form-input mt-2 text-xs font-black rounded-2xl bg-[#f8faff] border-[#dde4f1] h-12 pl-4 pr-10 shadow-sm focus:ring-4 focus:ring-[var(--brand-600)]/10 transition'
                    />
                    <span className='absolute right-4 top-[26px] text-xs font-bold text-[#8d98af]'>%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className='text-[10px] font-black uppercase tracking-widest text-[#8d98af] ml-1'>Findings & Justification</label>
                <textarea 
                  name='comment'
                  rows='8'
                  defaultValue={currentSection?.comment || ''}
                  placeholder='Detailed audit report for this specific section...'
                  className='form-input mt-2 text-xs font-bold rounded-2xl bg-[#f8faff] border-[#dde4f1] resize-none p-4 shadow-sm focus:ring-4 focus:ring-[var(--brand-600)]/10 transition'
                />
              </div>

              <button 
                type='submit' 
                disabled={isUpdating}
                className='btn-primary w-full h-14 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-[var(--brand-600)]/20 active:scale-[0.98] transition-all duration-300 font-black uppercase tracking-[0.1em] text-xs hover:-translate-y-0.5'
              >
                {isUpdating ? <Loader2 size={20} className='animate-spin' /> : <Save size={20} />}
                Save & Continue
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SectionsTab
