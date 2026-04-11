import type { JSX } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface HourData {
  hour: string;
  orders: number;
}

interface CityData {
  city: string;
  orders: number;
  gmv: number;
}

const AnalyticsPage = (): JSX.Element => {
  const cards = [
    {
      label: "Order volume (today)",
      value: 320,
      sub: "+8% vs yesterday",
      gradient:
        "bg-gradient-to-r from-emerald-400/70 via-emerald-500/60 to-[#38bdf8]/60",
    },
    {
      label: "On-time delivery rate",
      value: 96,
      sub: "Target 95%",
      gradient:
        "bg-gradient-to-r from-orange-400/70 via-orange-500/60 to-amber-400/60",
    },
    {
      label: "Repeat customers",
      value: 42,
      sub: "Last 30 days",
      gradient:
        "bg-gradient-to-r from-teal-400/70 via-cyan-500/60 to-sky-400/60",
    },
    {
      label: "GMV (this month)",
      value: 12.5,
      sub: "Platform gross merchandise value (Rs. Mn)",
      gradient:
        "bg-gradient-to-r from-indigo-400/70 via-blue-500/60 to-purple-500/60",
    },
  ];

  const orderVolume = cards[0].value;

  // Distribution (guaranteed integer total)
  const distribution = [0.05, 0.18, 0.3, 0.22, 0.15, 0.1];
  const hours = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];

  let remaining = orderVolume;

  const ordersByHour: HourData[] = distribution.map((ratio, index) => {
    if (index === distribution.length - 1) {
      return { hour: hours[index], orders: remaining };
    }

    const value = Math.round(orderVolume * ratio);
    remaining -= value;

    return {
      hour: hours[index],
      orders: value,
    };
  });

  const cityPerformance: CityData[] = [
    { city: "Colombo", orders: 140, gmv: 4.2 },
    { city: "Kandy", orders: 75, gmv: 2.1 },
    { city: "Galle", orders: 60, gmv: 1.8 },
    { city: "Jaffna", orders: 45, gmv: 1.2 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              {c.label}
            </p>

            <p
              className={`mt-3 inline-flex rounded-xl px-3 py-2 text-lg font-semibold text-white ${c.gradient}`}
            >
              {c.label.includes("GMV")
                ? `Rs. ${c.value}M`
                : c.label.includes("rate")
                ? `${c.value}%`
                : c.value}
            </p>

            <p className="mt-2 text-xs text-slate-300">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Orders by time */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-50">
            Orders by time of day
          </p>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#cbd5e1" />
                <YAxis allowDecimals={false} stroke="#cbd5e1" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City performance */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-50">
            City performance
          </p>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="city" stroke="#cbd5e1" />
                <YAxis allowDecimals={false} stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="orders" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;