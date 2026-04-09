import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Eye,
  FilePlus2,
  LineChart,
  PieChart,
  ShieldCheck,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import StatusBadge from '../components/StatusBadge'
import LevelBadge from '../components/LevelBadge'
import {
  fetchCertificateOverviewCharts,
  fetchCertificateOverviewStats,
  fetchCertificates,
} from '../store/certificateManagementSlice'
import {
  selectCertificateOverviewCharts,
  selectCertificateOverviewChartsError,
  selectCertificateOverviewChartsStatus,
  selectCertificateOverviewStats,
  selectCertificateOverviewStatsError,
  selectCertificateOverviewStatsStatus,
  selectCertificateManagementError,
  selectCertificates,
  selectCertificatesStatus,
} from '../store/certificateManagementSelectors'

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip, Filler)

const STATUS_ORDER = ['ACTIVE', 'EXPIRED', 'REVOKED', 'INACTIVE']
const LEVEL_ORDER = ['PLATINUM', 'GOLD', 'SILVER']

const STATUS_META = {
  ACTIVE: { label: 'Active', color: '#22c55e', barTone: 'bg-[#22c55e]' },
  EXPIRED: { label: 'Expired', color: '#f59e0b', barTone: 'bg-[#f59e0b]' },
  REVOKED: { label: 'Revoked', color: '#ef4444', barTone: 'bg-[#ef4444]' },
  INACTIVE: { label: 'Inactive', color: '#64748b', barTone: 'bg-[#64748b]' },
}

const LEVEL_META = {
  PLATINUM: { label: 'Platinum', color: '#6366f1' },
  GOLD: { label: 'Gold', color: '#f59e0b' },
  SILVER: { label: 'Silver', color: '#94a3b8' },
}

const CARD_BASE =
  'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.1)]'

function toDate(value) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function daysBetween(fromDate, toDateValue) {
  const from = toDate(fromDate)
  const to = toDate(toDateValue)

  if (!from || !to) {
    return null
  }

  const diffMs = to.getTime() - from.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function CertificateOverviewPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const certificates = useAppSelector(selectCertificates)
  const certificatesStatus = useAppSelector(selectCertificatesStatus)
  const overviewStats = useAppSelector(selectCertificateOverviewStats)
  const overviewStatsStatus = useAppSelector(selectCertificateOverviewStatsStatus)
  const overviewStatsError = useAppSelector(selectCertificateOverviewStatsError)
  const overviewCharts = useAppSelector(selectCertificateOverviewCharts)
  const overviewChartsStatus = useAppSelector(selectCertificateOverviewChartsStatus)
  const overviewChartsError = useAppSelector(selectCertificateOverviewChartsError)
  const listError = useAppSelector(selectCertificateManagementError)

  const isTableLoading = certificatesStatus === 'loading' || certificatesStatus === 'idle'
  const isStatsLoading = overviewStatsStatus === 'loading' || overviewStatsStatus === 'idle'
  const isChartsLoading = overviewChartsStatus === 'loading' || overviewChartsStatus === 'idle'
  const dashboardError = overviewStatsError || overviewChartsError

  useEffect(() => {
    if (certificatesStatus === 'idle') {
      dispatch(fetchCertificates(''))
    }

    if (overviewStatsStatus === 'idle') {
      dispatch(fetchCertificateOverviewStats())
    }

    if (overviewChartsStatus === 'idle') {
      dispatch(fetchCertificateOverviewCharts())
    }
  }, [certificatesStatus, dispatch, overviewChartsStatus, overviewStatsStatus])

  const metrics = useMemo(() => {
    const source = overviewStats || {}

    return {
      total: toNumber(source.totalCertificates),
      active: toNumber(source.activeCertificates),
      expired: toNumber(source.expiredCertificates),
      revoked: toNumber(source.revokedCertificates),
      inactive: toNumber(source.inactiveCertificates),
      riskStates: toNumber(source.riskStateCertificates),
      expiringSoon: toNumber(source.expiringIn45Days),
      readyToIssue: toNumber(source.eligibleToIssue),
      averageTrust: toNumber(source.averageActiveTrustScore),
    }
  }, [overviewStats])

  const statusDistribution = useMemo(
    () => (Array.isArray(overviewCharts?.statusDistribution) ? overviewCharts.statusDistribution : []),
    [overviewCharts],
  )
  const levelDistribution = useMemo(
    () => (Array.isArray(overviewCharts?.levelDistribution) ? overviewCharts.levelDistribution : []),
    [overviewCharts],
  )
  const monthlyTrend = useMemo(
    () => (Array.isArray(overviewCharts?.monthlyIssuedTrend) ? overviewCharts.monthlyIssuedTrend : []),
    [overviewCharts],
  )

  const statusBreakdown = useMemo(() => {
    const map = new Map(statusDistribution.map((item) => [String(item?.status || '').toUpperCase(), item]))
    return STATUS_ORDER.map((status) => {
      const row = map.get(status)
      const meta = STATUS_META[status]
      return {
        status,
        label: meta?.label || status,
        value: toNumber(row?.count),
        percentage: toNumber(row?.percentage),
        color: meta?.color || '#64748b',
        barTone: meta?.barTone || 'bg-slate-500',
      }
    })
  }, [statusDistribution])

  const levelBreakdown = useMemo(() => {
    const map = new Map(levelDistribution.map((item) => [String(item?.level || '').toUpperCase(), item]))
    return LEVEL_ORDER.map((level) => {
      const row = map.get(level)
      const meta = LEVEL_META[level]
      return {
        level,
        label: meta?.label || level,
        value: toNumber(row?.count),
        percentage: toNumber(row?.percentage),
        color: meta?.color || '#94a3b8',
      }
    })
  }, [levelDistribution])

  const latestCertificates = useMemo(() => certificates.slice(0, 8), [certificates])

  const expiringCertificates = useMemo(() => {
    const now = new Date()

    return certificates
      .filter((item) => item.status === 'ACTIVE')
      .map((item) => ({
        ...item,
        daysLeft: daysBetween(now, item.expiryDate),
      }))
      .filter((item) => item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 45)
      .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
      .slice(0, 4)
  }, [certificates])

  const trendInsight = useMemo(() => {
    const last = toNumber(monthlyTrend[monthlyTrend.length - 1]?.issuedCount)
    const previous = toNumber(monthlyTrend[monthlyTrend.length - 2]?.issuedCount)
    const diff = last - previous
    const hasPrevious = previous > 0
    const deltaPercent = hasPrevious ? Math.round((Math.abs(diff) / previous) * 100) : last > 0 ? 100 : 0

    return {
      last,
      previous,
      diff,
      deltaPercent,
      trendLabel:
        diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    }
  }, [monthlyTrend])

  const kpiCards = useMemo(
    () => [
      {
        key: 'total',
        label: 'Total Certificates',
        value: metrics.total,
        Icon: Activity,
        tint: 'from-[#eef2ff] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#c7d2fe]',
        iconBg: 'bg-[#e0e7ff]',
        iconColor: 'text-[#4f46e5]',
        insight: `${trendInsight.last} issued this month`,
      },
      {
        key: 'active',
        label: 'Active',
        value: metrics.active,
        Icon: ShieldCheck,
        tint: 'from-[#ecfdf5] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#bbf7d0]',
        iconBg: 'bg-[#dcfce7]',
        iconColor: 'text-[#16a34a]',
        insight: `${metrics.total ? Math.round((metrics.active / metrics.total) * 100) : 0}% of all`,
      },
      {
        key: 'expiring',
        label: 'Expiring In 45 Days',
        value: metrics.expiringSoon,
        Icon: Clock3,
        tint: 'from-[#fffbeb] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#fde68a]',
        iconBg: 'bg-[#fef3c7]',
        iconColor: 'text-[#d97706]',
        insight: metrics.expiringSoon > 0 ? 'Needs renewal planning' : 'No immediate pressure',
      },
      {
        key: 'eligible',
        label: 'Eligible To Issue',
        value: metrics.readyToIssue,
        Icon: FilePlus2,
        tint: 'from-[#ecfeff] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#bae6fd]',
        iconBg: 'bg-[#cffafe]',
        iconColor: 'text-[#0e7490]',
        insight: metrics.readyToIssue > 0 ? 'Ready for quick issuance' : 'No pending eligible hotels',
      },
      {
        key: 'risk',
        label: 'Risk States',
        value: metrics.riskStates,
        Icon: AlertTriangle,
        tint: 'from-[#fef2f2] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#fecaca]',
        iconBg: 'bg-[#fee2e2]',
        iconColor: 'text-[#dc2626]',
        insight: `${metrics.revoked} revoked / ${metrics.expired} expired`,
      },
      {
        key: 'trust',
        label: 'Avg Active Trust',
        value: metrics.averageTrust,
        Icon: LineChart,
        tint: 'from-[#eef2ff] via-[#ffffff] to-[#f8fafc]',
        ring: 'border-[#c7d2fe]',
        iconBg: 'bg-[#e0e7ff]',
        iconColor: 'text-[#6366f1]',
        insight:
          trendInsight.trendLabel === 'up'
            ? `+${trendInsight.deltaPercent}% vs last month`
            : trendInsight.trendLabel === 'down'
              ? `-${trendInsight.deltaPercent}% vs last month`
              : 'Stable vs last month',
      },
    ],
    [metrics, trendInsight.deltaPercent, trendInsight.last, trendInsight.trendLabel],
  )

  const statusChartData = useMemo(
    () => ({
      labels: statusBreakdown.map((item) => item.label),
      datasets: [
        {
          label: 'Certificates',
          data: statusBreakdown.map((item) => item.value),
          backgroundColor: statusBreakdown.map((item) => item.color),
          borderColor: '#f8fafc',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    }),
    [statusBreakdown],
  )

  const statusChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            color: '#475569',
            padding: 16,
            font: {
              size: 12,
            },
          },
        },
      },
    }),
    [],
  )

  const levelChartData = useMemo(
    () => ({
      labels: levelBreakdown.map((item) => item.label),
      datasets: [
        {
          label: 'Active Certificates',
          data: levelBreakdown.map((item) => item.value),
          backgroundColor: levelBreakdown.map((item) => item.color),
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 42,
        },
      ],
    }),
    [levelBreakdown],
  )

  const levelChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#64748b',
            font: {
              size: 11,
            },
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.25)',
          },
        },
        x: {
          ticks: {
            color: '#475569',
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    [],
  )

  const trendChartData = useMemo(
    () => ({
      labels: monthlyTrend.map((item) => item.label),
      datasets: [
        {
          label: 'Issued',
          data: monthlyTrend.map((item) => toNumber(item?.issuedCount)),
          borderColor: '#6366f1',
          borderWidth: 2.5,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          tension: 0.42,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart
            const { ctx, chartArea } = chart
            if (!chartArea) {
              return 'rgba(99, 102, 241, 0.18)'
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.32)')
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)')
            return gradient
          },
        },
      ],
    }),
    [monthlyTrend],
  )

  const trendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#64748b',
            font: {
              size: 11,
            },
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.22)',
          },
        },
        x: {
          ticks: {
            color: '#64748b',
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    [],
  )

  function handleStatusChartClick(_event, elements) {
    if (!elements?.length) {
      return
    }

    const index = elements[0].index
    const selected = statusBreakdown[index]
    if (!selected?.status || selected.value < 1) {
      return
    }

    navigate(`certificates?status=${encodeURIComponent(selected.status)}`)
  }

  function handleLevelChartClick(_event, elements) {
    if (!elements?.length) {
      return
    }

    const index = elements[0].index
    const selected = levelBreakdown[index]
    if (!selected?.level || selected.value < 1) {
      return
    }

    navigate(`certificates?status=ACTIVE&level=${encodeURIComponent(selected.level)}`)
  }

  return (
    <section className='space-y-6 rounded-[20px] bg-[#f8fafc] p-4 sm:p-5 xl:p-6'>
      {listError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{listError}</p>
      ) : null}
      {dashboardError ? (
        <p className='rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>{dashboardError}</p>
      ) : null}

      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-slate-900'>Certificate Overview</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Decision dashboard for lifecycle risk, issuance pace, and operational health.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Link
            to='issue'
            className='inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-100'
          >
            <FilePlus2 className='h-4 w-4' />
            Issue Certificate
          </Link>
          <Link
            to='certificates?status=ACTIVE&expiring=45'
            className='inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50'
          >
            <Eye className='h-4 w-4' />
            View Expiring
          </Link>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-6'>
        {kpiCards.map((card) => (
          <article
            key={card.key}
            className={`${CARD_BASE} h-full border ${card.ring} bg-gradient-to-br ${card.tint}`}
          >
            <div className='flex items-start justify-between gap-3'>
              <div className={`rounded-xl p-2 ${card.iconBg}`}>
                <card.Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>{card.label}</p>
            </div>
            <p className='mt-3 text-2xl font-bold text-slate-900'>{card.value}</p>
            <p className='mt-2 text-xs text-slate-500'>{card.insight}</p>
          </article>
        ))}
      </div>

      <div className='grid gap-6 xl:grid-cols-12'>
        <div className='space-y-6 xl:col-span-8'>
          <article className={CARD_BASE}>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-start gap-2'>
                <div className='rounded-lg bg-indigo-100 p-2'>
                  <PieChart className='h-4 w-4 text-indigo-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900'>Status Distribution</h3>
                  <p className='text-sm text-slate-500'>Click a segment to open filtered certificates.</p>
                </div>
              </div>
              <Link to='certificates' className='text-xs font-medium text-indigo-600 hover:text-indigo-500'>
                View details
              </Link>
            </div>
            <div className='mt-4 h-72'>
              {isChartsLoading ? (
                <p className='rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading chart...</p>
              ) : (
                <Doughnut data={statusChartData} options={statusChartOptions} onClick={handleStatusChartClick} />
              )}
            </div>
          </article>

          <article className={CARD_BASE}>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-start gap-2'>
                <div className='rounded-lg bg-indigo-100 p-2'>
                  <LineChart className='h-4 w-4 text-indigo-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900'>12-Month Issuance Trend</h3>
                  <p className='text-sm text-slate-500'>Smooth month-by-month trajectory of certificate issuance.</p>
                </div>
              </div>
              <div className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600'>
                {trendInsight.diff >= 0 ? (
                  <ArrowUpRight className='h-3.5 w-3.5 text-emerald-600' />
                ) : (
                  <ArrowDownRight className='h-3.5 w-3.5 text-rose-600' />
                )}
                {trendInsight.deltaPercent}% vs last month
              </div>
            </div>
            <div className='mt-4 h-72'>
              {isChartsLoading ? (
                <p className='rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading chart...</p>
              ) : (
                <Line data={trendChartData} options={trendChartOptions} />
              )}
            </div>
          </article>
        </div>

        <div className='space-y-6 xl:col-span-4'>
          <article className={CARD_BASE}>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div className='flex items-start gap-2'>
                <div className='rounded-lg bg-indigo-100 p-2'>
                  <Activity className='h-4 w-4 text-indigo-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900'>Active Level Distribution</h3>
                  <p className='text-sm text-slate-500'>Click a bar to open ACTIVE + level filtered list.</p>
                </div>
              </div>
              <Link to='certificates?status=ACTIVE' className='text-xs font-medium text-indigo-600 hover:text-indigo-500'>
                View details
              </Link>
            </div>
            <div className='mt-4 h-72'>
              {isChartsLoading ? (
                <p className='rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading chart...</p>
              ) : (
                <Bar data={levelChartData} options={levelChartOptions} onClick={handleLevelChartClick} />
              )}
            </div>
          </article>

          <article className={CARD_BASE}>
            <div className='flex items-start gap-2'>
              <div className='rounded-lg bg-indigo-100 p-2'>
                <ShieldCheck className='h-4 w-4 text-indigo-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-slate-900'>Lifecycle Health</h3>
                <p className='text-sm text-slate-500'>Quick pressure snapshot across all certificate states.</p>
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs uppercase tracking-wide text-slate-500'>Average Active Trust</p>
              <p className='mt-1 text-2xl font-bold text-slate-900'>{metrics.averageTrust}</p>
            </div>

            <div className='mt-4 space-y-3'>
              {statusBreakdown.map((item) => (
                <div key={item.status}>
                  <div className='mb-1 flex items-center justify-between text-xs text-slate-600'>
                    <span>{item.label}</span>
                    <span>{item.value} ({item.percentage}%)</span>
                  </div>
                  <div className='h-2 rounded-full bg-slate-200'>
                    <div className={`h-2 rounded-full ${item.barTone}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>

      <div className='grid gap-6 xl:grid-cols-12'>
        <article className={`${CARD_BASE} xl:col-span-8`}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-start gap-2'>
              <div className='rounded-lg bg-indigo-100 p-2'>
                <Activity className='h-4 w-4 text-indigo-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-slate-900'>Latest Certificates</h3>
                <p className='text-sm text-slate-500'>Most recently created certificates and their current health.</p>
              </div>
            </div>
            <Link
              to='certificates'
              className='rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition duration-200 ease-out hover:bg-slate-50'
            >
              Manage all
            </Link>
          </div>

          {isTableLoading ? (
            <p className='mt-4 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500'>Loading latest certificates...</p>
          ) : latestCertificates.length ? (
            <div className='mt-4 overflow-hidden rounded-xl border border-slate-200'>
              <div className='overflow-x-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-slate-50 text-left text-xs uppercase text-slate-500'>
                    <tr>
                      <th className='px-3 py-2'>Certificate</th>
                      <th className='px-3 py-2'>Hotel</th>
                      <th className='px-3 py-2'>Status</th>
                      <th className='px-3 py-2'>Level</th>
                      <th className='px-3 py-2'>Score</th>
                      <th className='px-3 py-2'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestCertificates.map((item, index) => (
                      <tr
                        key={item._id || item.certificateNumber}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} transition-colors hover:bg-indigo-50/50`}
                      >
                        <td className='px-3 py-2 font-semibold text-slate-900'>{item.certificateNumber}</td>
                        <td className='px-3 py-2 text-slate-700'>{item.hotelId?.businessInfo?.name || 'Unknown hotel'}</td>
                        <td className='px-3 py-2'>
                          <StatusBadge status={item.status} />
                        </td>
                        <td className='px-3 py-2'>
                          <LevelBadge level={item.level} />
                        </td>
                        <td className='px-3 py-2 text-slate-700'>{item.trustScore ?? 'N/A'}</td>
                        <td className='px-3 py-2'>
                          <Link
                            to={`certificates/${encodeURIComponent(item.certificateNumber)}`}
                            className='inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition duration-200 ease-out hover:bg-slate-100'
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className='mt-4 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500'>No certificates available yet.</p>
          )}
        </article>

        <article className={`${CARD_BASE} xl:col-span-4`}>
          <div className='flex items-start gap-2'>
            <div className='rounded-lg bg-indigo-100 p-2'>
              <LineChart className='h-4 w-4 text-indigo-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>Insights Panel</h3>
              <p className='text-sm text-slate-500'>High-impact signals and fast actions.</p>
            </div>
          </div>

          <div className='mt-4 space-y-3'>
            <article className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <p className='text-xs uppercase tracking-wide text-slate-500'>Issuance Momentum</p>
              <p className='mt-1 text-sm font-semibold text-slate-800'>
                {trendInsight.diff > 0
                  ? `Up ${trendInsight.deltaPercent}% from last month`
                  : trendInsight.diff < 0
                    ? `Down ${trendInsight.deltaPercent}% from last month`
                    : 'No change from last month'}
              </p>
            </article>

            <article className='rounded-xl border border-rose-200 bg-rose-50 p-3'>
              <p className='text-xs uppercase tracking-wide text-rose-600'>Risk Focus</p>
              <p className='mt-1 text-sm font-semibold text-rose-800'>
                {metrics.riskStates} certificate{metrics.riskStates === 1 ? '' : 's'} in risk states.
              </p>
            </article>

            <article className='rounded-xl border border-amber-200 bg-amber-50 p-3'>
              <p className='text-xs uppercase tracking-wide text-amber-700'>Renewal Watchlist</p>
              {isTableLoading ? (
                <p className='mt-1 text-sm text-amber-800/80'>Loading...</p>
              ) : expiringCertificates.length ? (
                <ul className='mt-2 space-y-2 text-xs text-amber-900'>
                  {expiringCertificates.map((item) => (
                    <li key={item._id || item.certificateNumber} className='rounded-lg bg-white/75 px-2 py-1.5'>
                      <p className='font-semibold'>{item.hotelId?.businessInfo?.name || item.certificateNumber}</p>
                      <p>{item.daysLeft} day(s) left</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-1 text-sm text-amber-800/80'>No active certificates expiring in next 45 days.</p>
              )}
            </article>
          </div>

          <div className='mt-4 grid gap-2 sm:grid-cols-2'>
            <Link
              to='issue'
              className='inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-indigo-500'
            >
              <FilePlus2 className='h-4 w-4' />
              Issue
            </Link>
            <Link
              to='certificates?status=ACTIVE&expiring=45'
              className='inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50'
            >
              <Clock3 className='h-4 w-4' />
              View Expiring
            </Link>
          </div>
        </article>
      </div>

      {(isStatsLoading || isChartsLoading) && !dashboardError ? (
        <p className='text-xs text-slate-500'>Refreshing dashboard analytics...</p>
      ) : null}
    </section>
  )
}

export default CertificateOverviewPage
