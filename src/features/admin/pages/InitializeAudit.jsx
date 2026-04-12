import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  ArrowRight,
  ClipboardPlus,
  CheckCircle2,
  X,
  Building2
} from 'lucide-react'
import { auditApi } from '../../audit/api/auditApi'

function Toast({ type = 'success', title, message, onClose }) {
  const configs = {
    success: {
      bg: 'bg-[#ecfdf3] border-[#d1fadf]',
      iconBg: 'bg-[#d1fadf] text-[#039855]',
      icon: CheckCircle2,
      titleColor: 'text-[#067647]',
      msgColor: 'text-[#067647]',
    },
    error: {
      bg: 'bg-[#fff1f3] border-[#ffe4e6]',
      iconBg: 'bg-[#ffe4e6] text-[#e11d48]',
      icon: AlertCircle,
      titleColor: 'text-[#9f1239]',
      msgColor: 'text-[#be123c]',
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
          <h4 className={`text-sm font-bold ${config.titleColor}`}>{title}</h4>
          <p className={`mt-1 text-xs font-medium opacity-90 ${config.msgColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`absolute top-4 right-4 ${config.titleColor} opacity-40 hover:opacity-100 transition`}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function InitializeAudit() {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [hotels, setHotels] = useState([])
  const [auditors, setAuditors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Selection state
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [selectedAuditor, setSelectedAuditor] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [hotelsRes, auditorsRes, auditsRes] = await Promise.all([
          auditApi.getHotels(token),
          auditApi.getAuditors(token).catch(err => {
            console.warn('Failed to fetch auditors, using empty list', err)
            return { data: [] }
          }),
          auditApi.getAllAudits({}, token)
        ])

        // Normalize API payloads to avoid runtime crashes on malformed/null rows.
        const auditRows = Array.isArray(auditsRes.data) ? auditsRes.data.filter(Boolean) : []
        const hotelRows = Array.isArray(hotelsRes.data) ? hotelsRes.data.filter(Boolean) : []
        const auditorRows = Array.isArray(auditorsRes.data) ? auditorsRes.data.filter(Boolean) : []

        // Get IDs of hotels that already have an audit.
        const auditedHotelIds = new Set(
          auditRows
            .map((a) => {
              const hotel = a?.hotel
              if (!hotel) return null
              if (typeof hotel === 'object') return hotel?._id || null
              return hotel
            })
            .filter(Boolean)
        )

        // Filter out hotels that already have an audit
        const availableHotels = hotelRows.filter((h) => h?._id && !auditedHotelIds.has(h._id))

        // Match sorting requirement: sorted by date and time (newest first)
        const sortedHotels = availableHotels.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )

        setHotels(sortedHotels)
        setAuditors(auditorRows)
      } catch (err) {
        console.error('Initialization fetch error:', err)
        setError(err.message)
        setToast({
          type: 'error',
          title: 'Fetch Failed',
          message: err.message || 'Could not load hotels or auditors.'
        })
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchData()
  }, [token])

  const handleInitialize = async () => {
    if (!selectedHotel || !selectedAuditor) {
      setToast({
        type: 'error',
        title: 'Selection Required',
        message: 'Please select both a hotel and an auditor.'
      })
      return
    }

    try {
      setIsInitializing(true)
      const res = await auditApi.createAudit({
        hotel: selectedHotel._id,
        auditor: selectedAuditor,
        auditStartDate: new Date().toISOString()
      }, token)

      setToast({
        type: 'success',
        title: 'Audit Initialized',
        message: 'Redirecting to audit details...'
      })

      setTimeout(() => {
        navigate(`/audit/${res.data._id}`)
      }, 1500)
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Initialization Failed',
        message: err.message
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const filteredHotels = hotels.filter(h =>
    h.businessInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.businessInfo?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className='flex h-[60vh] flex-col items-center justify-center space-y-4'>
      <Loader2 className='animate-spin text-[var(--brand-600)]' size={48} />
      <p className='text-sm font-bold text-[#5f6f8c] animate-pulse uppercase tracking-widest'>Loading Hotels...</p>
    </div>
  )

  return (
    <div className='fade-up space-y-8 pb-12'>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-3xl font-black tracking-tight text-[#1f2b49]'>Initialize New Audit</h1>
          <p className='mt-2 text-[#5f6f8c] font-medium'>Select an registered hotel and assign an auditor to begin the certification process.</p>
        </div>
        <div className='flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-[#eef2f8]'>
          <div className='flex flex-col items-end pr-4 border-r border-[#eef2f8]'>
            <span className='text-[10px] font-black uppercase tracking-wider text-[#8d98af]'>Registered Hotels</span>
            <span className='text-lg font-black text-[#1f2b49]'>{hotels.length}</span>
          </div>
          <ClipboardPlus size={24} className='text-[var(--brand-600)] ml-2' />
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
        {/* LEFT: HOTEL LISTING */}
        <div className='xl:col-span-2 space-y-6'>
          <div className='glass-panel p-6 rounded-3xl border border-[#eef2f8] bg-white'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='relative flex-1'>
                <Search size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-[#95a2ba]' />
                <input
                  type='text'
                  placeholder='Search by hotel name or registration number...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-12 w-full rounded-2xl border border-[#dde4f1] bg-[#f8faff] pl-12 pr-4 text-sm font-bold text-[#1f2b49] outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10'
                />
              </div>
            </div>

            <div className='overflow-hidden rounded-2xl border border-[#f0f4ff]'>
              <table className='w-full text-left'>
                <thead className='bg-[#f9fbff] text-[10px] font-black uppercase tracking-widest text-[#8d98af]'>
                  <tr>
                    <th className='px-6 py-4'>Hotel / Business</th>
                    <th className='px-6 py-4'>Type</th>
                    <th className='px-6 py-4'>Created Date</th>
                    <th className='px-6 py-4 text-center'>Select</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#f0f4ff] bg-white'>
                  {filteredHotels.length === 0 ? (
                    <tr>
                      <td colSpan='4' className='px-6 py-12 text-center'>
                        <p className='text-sm font-bold text-[#8d98af]'>No hotels found matching your search.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHotels.map((h) => (
                      <tr
                        key={h._id}
                        onClick={() => setSelectedHotel(h)}
                        className={`cursor-pointer transition-all duration-300 ${selectedHotel?._id === h._id ? 'bg-[var(--brand-50)]/50' : 'hover:bg-[#f9fbff]'}`}
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedHotel?._id === h._id ? 'bg-[var(--brand-600)] text-white' : 'bg-[#f0f4ff] text-[var(--brand-600)]'}`}>
                              <PlusCircle size={20} />
                            </div>
                            <div>
                              <p className='text-sm font-black text-[#1f2b49]'>{h.businessInfo?.name}</p>
                              <p className='text-[10px] font-bold text-[#8d98af]'>{h.businessInfo?.registrationNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <span className='px-3 py-1 bg-[#f0f4ff] text-[10px] font-black uppercase text-[var(--brand-700)] rounded-full'>
                            {h.businessInfo?.businessType || 'N/A'}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <p className='text-[11px] font-bold text-[#5f6f8c] flex items-center gap-1.5'>
                            <Calendar size={12} />
                            {new Date(h.createdAt).toLocaleDateString()}
                          </p>
                          <p className='text-[10px] text-[#8d98af]'>{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className='px-6 py-4 text-center'>
                          <div className={`mx-auto h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedHotel?._id === h._id ? 'border-[var(--brand-600)] bg-[var(--brand-600)]' : 'border-[#dde4f1]'}`}>
                            {selectedHotel?._id === h._id && <div className='h-2 w-2 rounded-full bg-white animate-in zoom-in' />}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: INITIALIZATION FORM */}
        <div className='space-y-6'>
          <div className='glass-panel p-8 rounded-3xl border border-[#eef2f8] bg-white sticky top-24'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='h-12 w-12 rounded-2xl bg-[var(--brand-600)] flex items-center justify-center text-white shadow-lg shadow-[var(--brand-600)]/20'>
                <ArrowRight size={24} />
              </div>
              <h2 className='text-xl font-black text-[#1f2b49]'>Initialization</h2>
            </div>

            <div className='space-y-8'>
              {/* HOTEL PREVIEW */}
              <div className='space-y-3'>
                <label className='text-[10px] font-black uppercase tracking-[0.2em] text-[#8d98af] ml-1'>Selected Hotel</label>
                {selectedHotel ? (
                  <div className='p-4 rounded-2xl bg-[var(--brand-50)] border border-[var(--brand-100)] flex items-center gap-4 animate-in slide-in-from-right-2'>
                    <Building2 className='text-[var(--brand-600)]' size={24} />
                    <div>
                      <p className='text-sm font-black text-[var(--brand-700)]'>{selectedHotel.businessInfo?.name}</p>
                      <p className='text-[11px] font-bold text-[var(--brand-600)]/70'>{selectedHotel.businessInfo?.contact?.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className='p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center'>
                    <p className='text-xs font-bold text-[#8d98af] italic'>Please select a hotel from the list</p>
                  </div>
                )}
              </div>

              {/* AUDITOR SELECTION */}
              <div className='space-y-3'>
                <label className='text-[10px] font-black uppercase tracking-[0.2em] text-[#8d98af] ml-1'>Assign Auditor</label>
                <div className='relative'>
                  <User size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-[#95a2ba]' />
                  <select
                    value={selectedAuditor}
                    onChange={(e) => setSelectedAuditor(e.target.value)}
                    className='h-14 w-full rounded-2xl border border-[#dde4f1] bg-[#f8faff] pl-12 pr-4 text-sm font-black text-[#1f2b49] outline-none transition appearance-none focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10 cursor-pointer'
                  >
                    <option value=''>Choose an auditor...</option>
                    {auditors.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                    ))}
                  </select>
                  {auditors.length === 0 && !loading && (
                    <p className='mt-2 text-[10px] font-bold text-amber-600 flex items-center gap-1'>
                      <AlertCircle size={10} />
                      No auditors found in the database.
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleInitialize}
                disabled={isInitializing || !selectedHotel || !selectedAuditor}
                className='btn-primary w-full h-16 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-[var(--brand-600)]/20 active:scale-[0.98] transition-all duration-300 font-black uppercase tracking-[0.15em] text-xs disabled:opacity-50 disabled:grayscale hover:-translate-y-1'
              >
                {isInitializing ? (
                  <Loader2 size={20} className='animate-spin' />
                ) : (
                  <>
                    <ClipboardPlus size={20} />
                    Initialize Audit
                  </>
                )}
              </button>

              <p className='text-[10px] text-center text-[#8d98af] font-medium leading-relaxed px-4'>
                By initializing, you create a new assessment workspace. The assigned auditor will be notified to begin the review process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InitializeAudit
