import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/ui';
import RiskDonut from '../charts/RiskDonut';
import { alertsTrend } from '../../data/mockData';

const tones = {
  blue: { text: 'text-brand-600', border: 'border-brand-100', bg: 'bg-brand-50/60' },
  red: { text: 'text-red-600', border: 'border-red-100', bg: 'bg-red-50/60' },
  green: { text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/60' },
  purple: { text: 'text-violet-600', border: 'border-violet-100', bg: 'bg-violet-50/60' },
};

function Kpi({ label, value, delta, tone, to }: { label: string; value: string; delta: string; tone: keyof typeof tones; to: string }) {
  const t = tones[tone];
  return (
    <Link to={to} className={`group block rounded-lg border p-3 transition-shadow hover:shadow-card ${t.border} ${t.bg}`}>
      <p className={`text-xs font-medium ${t.text}`}>{label}</p>
      <p className={`mt-1 text-[28px] font-semibold leading-none tabular-nums ${t.text}`}>{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowUpRight className="h-3 w-3" />{delta}</p>
    </Link>
  );
}

export default function OverviewSection() {
  return (
    <Card title="Dashboard Overview" subtitle="Last 24 hours · all channels">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total Transactions" value="12.8M" delta="+16.5%" tone="blue" to="/transactions" />
        <Kpi label="High Risk Alerts" value="354" delta="+12.3%" tone="red" to="/alerts" />
        <Kpi label="Cases Under Review" value="128" delta="+8.7%" tone="green" to="/cases" />
        <Kpi label="Active Cases" value="76" delta="+5.1%" tone="purple" to="/cases" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Risk Score Distribution</h3>
          <RiskDonut />
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Alerts Trend (Last 7 Days)</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alertsTrend} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#EEF1F6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [v, 'Alerts']} labelFormatter={(l, p) => `${p?.[0]?.payload?.label ?? ''} ${l}`} />
                <Area type="monotone" dataKey="alerts" stroke="#2F6BEB" strokeWidth={2} fill="#2F6BEB" fillOpacity={0.08} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
