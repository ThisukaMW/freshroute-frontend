// This is the Admin Analytics Dashboard page — shows charts and KPI cards for revenue, orders, transactions, and refunds

import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import {
  AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import { getAdminAnalytics } from '../../api/endpoints/adminAnalytics'
import type { Period, AdminAnalyticsData } from '../../api/endpoints/adminAnalytics'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Turns a raw number into a readable money string like "Rs. 1.2M" or "Rs. 500K"
const formatRevenue = (v: number): string => {
  if (v >= 1_000_000) return `Rs. ${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000)     return `Rs. ${(v / 1_000).toFixed(2)}K`
  return `Rs. ${v.toFixed(2)}`
}

// Rounds any number to 2 decimal places for display
const round2 = (v: number): number => Math.round(v * 100) / 100

// Custom popup that shows when you hover over any chart — displays the label and values nicely
const CustomTooltip = ({ active, payload, label }: any) => {
  // If the tooltip is not active or has no data, show nothing
  //active (is the mouse hovering?), payload (the actual data values)
  if (!active || !payload?.length) return null
  return (
    //label (the X-axis label like "Jan"
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold text-slate-300">{label}</p>  
      {/* Loop through each data line and show its value with the right format */}
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}:{' '}
          <span className="font-semibold">
            {p.dataKey === 'revenue'     ? formatRevenue(p.value)
            : p.dataKey === 'aov'        ? `Rs. ${round2(p.value).toFixed(2)}`
            : p.dataKey === 'refundRate' ? `${round2(p.value).toFixed(2)}%`
            : p.value.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  )
}

// Row of buttons (daily / weekly / monthly / yearly) — clicking one changes which time period the charts show
const PeriodSelector = ({ value, onChange }: { value: Period; onChange: (p: Period) => void }) => (
  <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
    {/* Render one button for each period option */}
    {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        // Highlight the currently selected period in green, others stay grey
        className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          value === p
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
        }`}
      >
        {p}
      </button>
    ))}
  </div>
)

// ─── Skeleton loader ──────────────────────────────────────────────────────────

// Grey pulsing placeholder box shown while data is still loading
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/5 ${className ?? ''}`} />
)

// ─── Main ─────────────────────────────────────────────────────────────────────

const AnalyticsPage = (): JSX.Element => {
  // Tracks which time period is selected — starts as 'monthly'
  const [period, setPeriod] = useState<Period>('monthly')

  // Holds all the chart data fetched from the API — starts as null (nothing yet)
  const [data, setData] = useState<AdminAnalyticsData | null>(null)

  // True while waiting for API data, shows skeletons during this time
  const [loading, setLoading] = useState(true)

  // Holds an error message string if the API call fails, otherwise null
  const [error, setError] = useState<string | null>(null)

  // Runs every time 'period' changes — fetches fresh analytics data from the API
  useEffect(() => {
    // 'cancelled' flag stops old requests from updating state if period changed quickly
    let cancelled = false
    setLoading(true)
    setError(null)    /*Clears any old error*/
    getAdminAnalytics(period)
    /*If click "weekly" and then immediately click "monthly", the weekly request might finish AFTER monthly — the flag makes sure the old request can't mess up the new data*/
      .then((d) => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Failed to load analytics'); setLoading(false) } })
    // Cleanup: mark as cancelled when the component unmounts or period changes again
    return () => { cancelled = true }
  }, [period])

  // ── Derived KPIs ────────────────────────────────────────────────────────────

  // Add up all revenue values across every data point in revenueTrend
  const totalRevenue = data?.revenueTrend.reduce((s, d) => s + d.revenue, 0) ?? 0

  // Add up all order counts across every data point in revenueTrend
  const totalOrders  = data?.revenueTrend.reduce((s, d) => s + d.orders,  0) ?? 0

  // Add up all successful transaction counts across transactionTrend
  const totalSuccess = data?.transactionTrend.reduce((s, d) => s + d.successful, 0) ?? 0

  // Add up all failed transaction counts across transactionTrend
  const totalFailed  = data?.transactionTrend.reduce((s, d) => s + d.failed,     0) ?? 0

  // Calculate the average order value (AOV) by summing all AOVs and dividing by count — rounded to 2 decimals
  const avgAov = data?.aovTrend.length
    ? round2(data.aovTrend.reduce((s, d) => s + d.aov, 0) / data.aovTrend.length)
    : 0

  // Calculate the average refund rate as a percentage string like "2.34", rounded to 2 decimals
  const avgRefund = data?.aovTrend.length
    ? (data.aovTrend.reduce((s, d) => s + d.refundRate, 0) / data.aovTrend.length).toFixed(2)
    : '0.00'

  // Calculate what % of all transactions were successful — avoids dividing by zero, rounded to 2 decimals
  const successRate = (totalSuccess + totalFailed) > 0
    ? ((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header — title and period switcher buttons ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Admin</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-slate-50">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">Platform-wide financial and operational insights.</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── Error banner — only shows if something went wrong with the API call ── */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── KPI Cards row — 4 summary number boxes at the top ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          // Show 4 skeleton boxes while loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          // Show the actual KPI cards once data is ready
          : [
              {
                label: 'Total Revenue',
                value: formatRevenue(totalRevenue),
                sub: `${totalOrders.toLocaleString()} orders`,
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10 border-emerald-400/20',
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
                    <path d="M8 2v12M5 5l3-3 3 3M5 11l3 3 3-3" />
                  </svg>
                ),
              },
              {
                label: 'Avg Order Value',
                value: `Rs. ${avgAov.toFixed(2)}`,
                sub: 'Per transaction',
                color: 'text-sky-400',
                bg: 'bg-sky-400/10 border-sky-400/20',
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
                    <rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M5 8h6M8 6v4" />
                  </svg>
                ),
              },
              {
                label: 'Transaction Success',
                value: `${successRate}%`,
                sub: `${totalFailed.toLocaleString()} failed`,
                color: 'text-teal-400',
                bg: 'bg-teal-400/10 border-teal-400/20',
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" /><path d="M5 8l2 2 4-4" />
                  </svg>
                ),
              },
              {
                label: 'Avg Refund Rate',
                value: `${avgRefund}%`,
                sub: 'Of total orders',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10 border-amber-400/20',
                icon: (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 16 16">
                    <path d="M3 8a5 5 0 109.9-1M3 8l2-2M3 8l2 2" />
                  </svg>
                ),
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl border ${c.bg} bg-white/5 p-4 backdrop-blur-xl transition hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-slate-400">{c.label}</p>
                  <span className={c.color}>{c.icon}</span>
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
              </div>
            ))
        }
      </div>

      {/* ── Revenue & Orders area chart — shows both lines over time ── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-50">Revenue & Orders</p>
            <p className="text-xs text-slate-400">Combined trend over selected period</p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-400">
            {formatRevenue(totalRevenue)} total
          </span>
        </div>
        {loading ? <Skeleton className="h-64" /> : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend ?? []}>
                {/* Gradient fill definitions for the shaded area under each line */}
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                {/* Left Y axis for revenue values */}
                <YAxis yAxisId="rev" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatRevenue} width={72} />
                {/* Right Y axis for order count values */}
                <YAxis yAxisId="ord" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke="#38bdf8" strokeWidth={2} fill="url(#ordGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Revenue by Seller (bar chart) + Category & Payment pies side by side ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Horizontal bar chart showing which seller made the most revenue */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm font-semibold text-slate-50">Revenue by Seller</p>
          <p className="mb-4 text-xs text-slate-400">Top vendors by gross revenue</p>
          {loading ? <Skeleton className="h-56" /> : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.revenueBySeller ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatRevenue} />
                    <YAxis type="category" dataKey="seller" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} width={88} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* List below the chart showing each seller's order count and revenue */}
              <div className="mt-4 space-y-1.5">
                {(data?.revenueBySeller ?? []).map((s) => (
                  <div key={s.seller} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <span className="text-xs font-medium text-slate-300">{s.seller}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">{s.orders.toLocaleString()} orders</span>
                      <span className="text-xs font-semibold text-emerald-400">{formatRevenue(s.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right column with two donut charts stacked */}
        <div className="flex flex-col gap-4">

          {/* Donut chart showing what % of orders came from each product category */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="mb-1 text-sm font-semibold text-slate-50">Revenue by Category</p>
            <p className="mb-3 text-xs text-slate-400">Share of total orders per product type</p>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.categoryBreakdown ?? []} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={2}>
                        {/* Each slice gets its own color from the data */}
                        {(data?.categoryBreakdown ?? []).map((c) => <Cell key={c.name} fill={c.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `${round2(v).toFixed(2)}%`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12, color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list next to the donut showing name and % for each category */}
                <div className="flex-1 space-y-1.5">
                  {(data?.categoryBreakdown ?? []).map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span className="text-xs text-slate-300">{c.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-200">{round2(c.value).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Donut chart showing what payment methods customers use (card, cash, etc.) */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="mb-1 text-sm font-semibold text-slate-50">Payment Method Breakdown</p>
            <p className="mb-3 text-xs text-slate-400">How customers pay on FreshRoute</p>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data?.paymentBreakdown ?? []} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={2}>
                        {(data?.paymentBreakdown ?? []).map((c) => <Cell key={c.name} fill={c.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `${round2(v).toFixed(2)}%`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {(data?.paymentBreakdown ?? []).map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span className="text-xs text-slate-300">{c.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-200">{round2(c.value).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Grouped bar chart comparing successful vs failed transactions over time ── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-50">Successful vs Failed Transactions</p>
            <p className="text-xs text-slate-400">
              {totalSuccess.toLocaleString()} successful · {totalFailed.toLocaleString()} failed · {successRate}% success rate
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs text-slate-400">Successful</span></div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400"     /><span className="text-xs text-slate-400">Failed</span></div>
          </div>
        </div>
        {loading ? <Skeleton className="h-56" /> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.transactionTrend ?? []} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successful" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed"     name="Failed"     fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Line chart showing average order value and refund rate together over time ── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-50">Average Order Value & Refund Rate</p>
          <p className="text-xs text-slate-400">
            Avg AOV: Rs. {avgAov.toFixed(2)} · Avg refund rate: {avgRefund}%
          </p>
        </div>
        {loading ? <Skeleton className="h-56" /> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.aovTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                {/* Left Y axis for Rs. values */}
                <YAxis yAxisId="aov" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `Rs.${round2(v).toFixed(2)}`} width={64} />
                {/* Right Y axis for % refund rate */}
                <YAxis yAxisId="ref" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${round2(v).toFixed(2)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                <Line yAxisId="aov" type="monotone" dataKey="aov"        name="Avg Order Value" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line yAxisId="ref" type="monotone" dataKey="refundRate" name="Refund Rate"     stroke="#fb923c" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  )
}

export default AnalyticsPage
