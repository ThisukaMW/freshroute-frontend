import { useState } from 'react'
import type { JSX } from 'react'
import {
  LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

// ─── Mock data ────────────────────────────────────────────────────────────────

const revenueData: Record<Period, { label: string; revenue: number; orders: number }[]> = {
  daily: [
    { label: '6AM',  revenue: 18400,  orders: 24  },
    { label: '9AM',  revenue: 54200,  orders: 71  },
    { label: '12PM', revenue: 91000,  orders: 118 },
    { label: '3PM',  revenue: 67500,  orders: 88  },
    { label: '6PM',  revenue: 48300,  orders: 63  },
    { label: '9PM',  revenue: 31600,  orders: 41  },
  ],
  weekly: [
    { label: 'Mon', revenue: 184000, orders: 240 },
    { label: 'Tue', revenue: 212000, orders: 275 },
    { label: 'Wed', revenue: 198000, orders: 258 },
    { label: 'Thu', revenue: 225000, orders: 293 },
    { label: 'Fri', revenue: 267000, orders: 347 },
    { label: 'Sat', revenue: 310000, orders: 403 },
    { label: 'Sun', revenue: 243000, orders: 316 },
  ],
  monthly: [
    { label: 'Jan', revenue: 1840000, orders: 2392 },
    { label: 'Feb', revenue: 2120000, orders: 2756 },
    { label: 'Mar', revenue: 1980000, orders: 2574 },
    { label: 'Apr', revenue: 2450000, orders: 3185 },
    { label: 'May', revenue: 2670000, orders: 3471 },
    { label: 'Jun', revenue: 3100000, orders: 4030 },
    { label: 'Jul', revenue: 2430000, orders: 3159 },
    { label: 'Aug', revenue: 2890000, orders: 3757 },
    { label: 'Sep', revenue: 3240000, orders: 4212 },
    { label: 'Oct', revenue: 3560000, orders: 4628 },
    { label: 'Nov', revenue: 3820000, orders: 4966 },
    { label: 'Dec', revenue: 4100000, orders: 5330 },
  ],
  yearly: [
    { label: '2021', revenue: 18400000, orders: 23920 },
    { label: '2022', revenue: 27500000, orders: 35750 },
    { label: '2023', revenue: 34200000, orders: 44460 },
    { label: '2024', revenue: 42800000, orders: 55640 },
    { label: '2025', revenue: 51600000, orders: 67080 },
  ],
}

const revenueBySellerData = [
  { seller: 'Green Market',  revenue: 1240000, orders: 1612 },
  { seller: 'City Veggies',  revenue: 980000,  orders: 1274 },
  { seller: 'Fresh Farms',   revenue: 820000,  orders: 1066 },
  { seller: 'Harvest Home',  revenue: 640000,  orders: 832  },
  { seller: 'Root & Branch', revenue: 510000,  orders: 663  },
  { seller: 'Others',        revenue: 1410000, orders: 1833 },
]

const categoryData = [
  { name: 'Vegetables',  value: 38, color: '#10b981' },
  { name: 'Fruits',      value: 24, color: '#38bdf8' },
  { name: 'Leafy Greens',value: 16, color: '#34d399' },
  { name: 'Herbs',       value: 11, color: '#a3e635' },
  { name: 'Root Crops',  value: 8,  color: '#fb923c' },
  { name: 'Other',       value: 3,  color: '#94a3b8' },
]

const paymentMethodData = [
  { name: 'Card',         value: 52, color: '#10b981' },
  { name: 'Cash on Del.', value: 31, color: '#38bdf8' },
  { name: 'Bank Transfer',value: 12, color: '#a78bfa' },
  { name: 'Wallet',       value: 5,  color: '#fb923c' },
]

const transactionData: Record<Period, { label: string; successful: number; failed: number }[]> = {
  daily: [
    { label: '6AM',  successful: 22,  failed: 2  },
    { label: '9AM',  successful: 68,  failed: 3  },
    { label: '12PM', successful: 112, failed: 6  },
    { label: '3PM',  successful: 84,  failed: 4  },
    { label: '6PM',  successful: 60,  failed: 3  },
    { label: '9PM',  successful: 38,  failed: 3  },
  ],
  weekly: [
    { label: 'Mon', successful: 228, failed: 12 },
    { label: 'Tue', successful: 261, failed: 14 },
    { label: 'Wed', successful: 245, failed: 13 },
    { label: 'Thu', successful: 278, failed: 15 },
    { label: 'Fri', successful: 330, failed: 17 },
    { label: 'Sat', successful: 383, failed: 20 },
    { label: 'Sun', successful: 300, failed: 16 },
  ],
  monthly: [
    { label: 'Jan', successful: 2272, failed: 120 },
    { label: 'Feb', successful: 2618, failed: 138 },
    { label: 'Mar', successful: 2445, failed: 129 },
    { label: 'Apr', successful: 3026, failed: 159 },
    { label: 'May', successful: 3297, failed: 174 },
    { label: 'Jun', successful: 3829, failed: 201 },
    { label: 'Jul', successful: 3001, failed: 158 },
    { label: 'Aug', successful: 3569, failed: 188 },
    { label: 'Sep', successful: 4001, failed: 211 },
    { label: 'Oct', successful: 4397, failed: 231 },
    { label: 'Nov', successful: 4718, failed: 248 },
    { label: 'Dec', successful: 5064, failed: 266 },
  ],
  yearly: [
    { label: '2021', successful: 22724, failed: 1196 },
    { label: '2022', successful: 33963, failed: 1787 },
    { label: '2023', successful: 42237, failed: 2223 },
    { label: '2024', successful: 52858, failed: 2782 },
    { label: '2025', successful: 63726, failed: 3354 },
  ],
}

const aovData: Record<Period, { label: string; aov: number; refundRate: number }[]> = {
  daily: [
    { label: '6AM',  aov: 767, refundRate: 1.2 },
    { label: '9AM',  aov: 763, refundRate: 0.9 },
    { label: '12PM', aov: 771, refundRate: 1.4 },
    { label: '3PM',  aov: 767, refundRate: 1.1 },
    { label: '6PM',  aov: 767, refundRate: 1.3 },
    { label: '9PM',  aov: 771, refundRate: 1.5 },
  ],
  weekly: [
    { label: 'Mon', aov: 767, refundRate: 1.2 },
    { label: 'Tue', aov: 771, refundRate: 1.0 },
    { label: 'Wed', aov: 767, refundRate: 1.3 },
    { label: 'Thu', aov: 768, refundRate: 0.9 },
    { label: 'Fri', aov: 769, refundRate: 1.1 },
    { label: 'Sat', aov: 769, refundRate: 1.4 },
    { label: 'Sun', aov: 769, refundRate: 1.2 },
  ],
  monthly: [
    { label: 'Jan', aov: 769, refundRate: 1.4 },
    { label: 'Feb', aov: 769, refundRate: 1.2 },
    { label: 'Mar', aov: 769, refundRate: 1.5 },
    { label: 'Apr', aov: 769, refundRate: 1.1 },
    { label: 'May', aov: 769, refundRate: 1.3 },
    { label: 'Jun', aov: 769, refundRate: 1.0 },
    { label: 'Jul', aov: 769, refundRate: 1.6 },
    { label: 'Aug', aov: 769, refundRate: 1.2 },
    { label: 'Sep', aov: 769, refundRate: 1.1 },
    { label: 'Oct', aov: 769, refundRate: 1.3 },
    { label: 'Nov', aov: 769, refundRate: 1.4 },
    { label: 'Dec', aov: 769, refundRate: 1.2 },
  ],
  yearly: [
    { label: '2021', aov: 769, refundRate: 2.1 },
    { label: '2022', aov: 769, refundRate: 1.9 },
    { label: '2023', aov: 769, refundRate: 1.6 },
    { label: '2024', aov: 769, refundRate: 1.4 },
    { label: '2025', aov: 769, refundRate: 1.2 },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRevenue = (v: number): string => {
  if (v >= 1_000_000) return `Rs. ${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `Rs. ${(v / 1_000).toFixed(0)}K`
  return `Rs. ${v}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{
            p.dataKey === 'revenue' ? formatRevenue(p.value)
            : p.dataKey === 'aov' ? `Rs. ${p.value}`
            : p.dataKey === 'refundRate' ? `${p.value}%`
            : p.value.toLocaleString()
          }</span>
        </p>
      ))}
    </div>
  )
}

const PeriodSelector = ({ value, onChange }: { value: Period; onChange: (p: Period) => void }) => (
  <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
    {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
const AnalyticsPage = (): JSX.Element => {
  const [period, setPeriod] = useState<Period>('monthly')

  const rev = revenueData[period]
  const txn = transactionData[period]
  const aov = aovData[period]

  const totalRevenue = rev.reduce((s, d) => s + d.revenue, 0)
  const totalOrders  = rev.reduce((s, d) => s + d.orders, 0)
  const totalSuccess = txn.reduce((s, d) => s + d.successful, 0)
  const totalFailed  = txn.reduce((s, d) => s + d.failed, 0)
  const avgAov       = Math.round(aov.reduce((s, d) => s + d.aov, 0) / aov.length)
  const avgRefund    = (aov.reduce((s, d) => s + d.refundRate, 0) / aov.length).toFixed(1)
  const successRate  = ((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(1)

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Admin</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-slate-50">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">Platform-wide financial and operational insights.</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* ── KPI row ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
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
            value: `Rs. ${avgAov.toLocaleString()}`,
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
              <span className={`${c.color}`}>{c.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-500">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue trend ── */}
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
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rev}>
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
              <YAxis yAxisId="rev" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => formatRevenue(v)} width={72} />
              <YAxis yAxisId="ord" orientation="right" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              <Area yAxisId="ord" type="monotone" dataKey="orders" name="Orders"
                stroke="#38bdf8" strokeWidth={2} fill="url(#ordGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Revenue by seller + Category pie ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Revenue by seller */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm font-semibold text-slate-50">Revenue by Seller</p>
          <p className="mb-4 text-xs text-slate-400">Top vendors by gross revenue</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBySellerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => formatRevenue(v)} />
                <YAxis type="category" dataKey="seller" stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 11 }} width={88} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Table */}
          <div className="mt-4 space-y-1.5">
            {revenueBySellerData.map((s) => (
              <div key={s.seller} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-xs font-medium text-slate-300">{s.seller}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{s.orders.toLocaleString()} orders</span>
                  <span className="text-xs font-semibold text-emerald-400">{formatRevenue(s.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category + payment method pies */}
        <div className="flex flex-col gap-4">

          {/* Category breakdown */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="mb-1 text-sm font-semibold text-slate-50">Revenue by Category</p>
            <p className="mb-3 text-xs text-slate-400">Share of total orders per product type</p>
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" cx="50%" cy="50%"
                      innerRadius={36} outerRadius={60} paddingAngle={2}>
                      {categoryData.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-slate-300">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment method breakdown */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="mb-1 text-sm font-semibold text-slate-50">Payment Method Breakdown</p>
            <p className="mb-3 text-xs text-slate-400">How customers pay on FreshRoute</p>
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethodData} dataKey="value" cx="50%" cy="50%"
                      innerRadius={36} outerRadius={60} paddingAngle={2}>
                      {paymentMethodData.map((c) => <Cell key={c.name} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {paymentMethodData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-slate-300">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Successful vs Failed transactions ── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-50">Successful vs Failed Transactions</p>
            <p className="text-xs text-slate-400">
              {totalSuccess.toLocaleString()} successful · {totalFailed.toLocaleString()} failed · {successRate}% success rate
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">Successful</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-xs text-slate-400">Failed</span>
            </div>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={txn} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="successful" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed"     name="Failed"     fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AOV & Refund rate ── */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-50">Average Order Value & Refund Rate</p>
          <p className="text-xs text-slate-400">
            Avg AOV: Rs. {avgAov.toLocaleString()} · Avg refund rate: {avgRefund}%
          </p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aov}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="aov" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => `Rs.${v}`} width={64} />
              <YAxis yAxisId="ref" orientation="right" stroke="#475569"
                tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line yAxisId="aov" type="monotone" dataKey="aov" name="Avg Order Value"
                stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line yAxisId="ref" type="monotone" dataKey="refundRate" name="Refund Rate"
                stroke="#fb923c" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}

export default AnalyticsPage