import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCertificates, getEligibleHotels } from '../certificateManagementService'

function CertificateOverviewPage() {
  const [certificates, setCertificates] = useState([])
  const [eligibleHotels, setEligibleHotels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [certificateResponse, eligibleResponse] = await Promise.all([
          getCertificates(''),
          getEligibleHotels(),
        ])

        if (ignore) {
          return
        }

        setCertificates(certificateResponse?.data || [])
        setEligibleHotels(eligibleResponse?.data || [])
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load overview')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [])

  const metrics = useMemo(() => {
    const active = certificates.filter((item) => item.status === 'ACTIVE').length
    const expired = certificates.filter((item) => item.status === 'EXPIRED').length
    const revoked = certificates.filter((item) => item.status === 'REVOKED').length
    const inactive = certificates.filter((item) => item.status === 'INACTIVE').length
    const readyToIssue = eligibleHotels.filter((item) => !item.alreadyCertified).length

    return [
      { label: 'Total Certificates', value: certificates.length, tone: 'bg-blue-50 text-blue-700 border-blue-200' },
      { label: 'Active', value: active, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { label: 'Eligible Hotels', value: readyToIssue, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
      { label: 'Risk States', value: revoked + expired + inactive, tone: 'bg-rose-50 text-rose-700 border-rose-200' },
    ]
  }, [certificates, eligibleHotels])

  const latest = useMemo(() => certificates.slice(0, 6), [certificates])

  return (
    <section className='space-y-5'>
      {errorMessage ? (
        <p className='rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{errorMessage}</p>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((item) => (
          <article key={item.label} className={`rounded-2xl border p-5 shadow-sm ${item.tone}`}>
            <p className='text-xs font-semibold uppercase tracking-wide'>{item.label}</p>
            <p className='mt-2 text-3xl font-black'>{item.value}</p>
          </article>
        ))}
      </div>

      <article className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-bold text-slate-900'>Latest Certificates</h2>
          <div className='flex gap-2'>
            <Link to='/admin/certificate-management/eligible-hotels' className='rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100'>
              View eligible hotels
            </Link>
            <Link to='/admin/certificate-management/certificates' className='rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700'>
              Open management
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className='mt-4 rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading overview...</p>
        ) : latest.length ? (
          <div className='mt-4 overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 text-left text-xs uppercase text-slate-500'>
                  <th className='px-3 py-2'>Certificate</th>
                  <th className='px-3 py-2'>Hotel</th>
                  <th className='px-3 py-2'>Status</th>
                  <th className='px-3 py-2'>Score</th>
                </tr>
              </thead>
              <tbody>
                {latest.map((item) => (
                  <tr key={item._id || item.certificateNumber} className='border-b border-slate-100'>
                    <td className='px-3 py-2 font-semibold text-slate-900'>{item.certificateNumber}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.hotelId?.businessInfo?.name || 'Unknown hotel'}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.status}</td>
                    <td className='px-3 py-2 text-slate-700'>{item.trustScore ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='mt-4 rounded-lg bg-slate-50 px-4 py-6 text-sm text-slate-500'>No certificates available yet.</p>
        )}
      </article>
    </section>
  )
}

export default CertificateOverviewPage
