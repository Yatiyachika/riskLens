import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { riskDistribution } from '../../data/mockData';

export default function RiskDonut({ data = riskDistribution, height = 150, centerLabel = '18%' }: { data?: { name: string; value: number; color: string }[]; height?: number; centerLabel?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="95%" paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-800">{centerLabel}</div>
      </div>
      <ul className="space-y-2 text-xs text-slate-600">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
