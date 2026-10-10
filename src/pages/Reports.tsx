import type { ReactElement } from 'react';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import RiskDonut from '../components/charts/RiskDonut';
import { useApp } from '../context/AppContext';
import { alertsTrend, detectionRate, highRiskCountries, transactions, volumeByMonth } from '../data/mockData';
import { downloadFile, toCsv } from '../utils';

const axis = { tick: { fontSize: 11, fill: '#94A3B8' }, tickLine: false, axisLine: false } as const;
const Chart = ({ children }: { children: ReactElement }) => <div className="h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;

export default function Reports() {
  const { cases, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const statusData = ['Open', 'In Progress', 'Under Review', 'Closed'].map((s, i) => ({
    status: s, count: cases.filter((c) => c.status === s).length, color: ['#DC2626', '#2F6BEB', '#F59E0B', '#94A3B8'][i],
  }));

  const exportCsv = () => {
    downloadFile('risklens-transactions.csv', toCsv(transactions.map((t) => ({ id: t.id, timestamp: t.timestamp, source: t.source, destination: t.destination, amount: t.amount, riskScore: t.riskScore, review: t.review }))));
    notify('CSV exported');
  };
  const generate = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const summary = { generatedAt: new Date().toISOString(), totalTransactions: '12.8M', highRiskAlerts: 354, detectionRate: '94.1%', casesByStatus: statusData.map(({ status, count }) => ({ status, count })), topCountries: highRiskCountries };
      downloadFile('risklens-report.json', JSON.stringify(summary, null, 2), 'application/json');
      notify('Report generated');
    }, 900);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Detection performance and risk analytics · Dec 2024 – May 2025"
        actions={<><Button onClick={exportCsv}>Export CSV</Button><Button variant="primary" disabled={busy} onClick={generate}>{busy ? 'Generating…' : 'Generate Report'}</Button></>} />
      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <Card title="Transaction volume" subtitle="Millions per month">
          <Chart><AreaChart data={volumeByMonth} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="#EEF1F6" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis {...axis} /><Tooltip formatter={(v: number) => [`${v}M`, 'Volume']} /><Area dataKey="volume" stroke="#2F6BEB" strokeWidth={2} fill="#2F6BEB" fillOpacity={0.08} /></AreaChart></Chart>
        </Card>
        <Card title="Fraud detection rate" subtitle="Share of confirmed fraud caught by the model">
          <Chart><LineChart data={detectionRate} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="#EEF1F6" vertical={false} /><XAxis dataKey="month" {...axis} /><YAxis domain={[85, 100]} {...axis} /><Tooltip formatter={(v: number) => [`${v}%`, 'Detection rate']} /><Line dataKey="rate" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} /></LineChart></Chart>
        </Card>
        <Card title="Risk distribution"><div className="py-4"><RiskDonut height={170} centerLabel="" /></div></Card>
        <Card title="Alerts over time" subtitle="Last 7 days">
          <Chart><BarChart data={alertsTrend} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="#EEF1F6" vertical={false} /><XAxis dataKey="label" {...axis} /><YAxis {...axis} /><Tooltip formatter={(v: number) => [v, 'Alerts']} /><Bar dataKey="alerts" fill="#2F6BEB" radius={[3, 3, 0, 0]} /></BarChart></Chart>
        </Card>
        <Card title="High-risk countries" subtitle="Alerts by country of origin">
          <Chart><BarChart data={highRiskCountries} layout="vertical" margin={{ left: 10, right: 16 }}><CartesianGrid stroke="#EEF1F6" horizontal={false} /><XAxis type="number" {...axis} /><YAxis type="category" dataKey="country" width={64} {...axis} /><Tooltip formatter={(v: number) => [v, 'Alerts']} /><Bar dataKey="alerts" fill="#DC2626" radius={[0, 3, 3, 0]} /></BarChart></Chart>
        </Card>
        <Card title="Cases by status">
          <Chart><BarChart data={statusData} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="#EEF1F6" vertical={false} /><XAxis dataKey="status" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip formatter={(v: number) => [v, 'Cases']} /><Bar dataKey="count" radius={[3, 3, 0, 0]}>{statusData.map((d) => <Cell key={d.status} fill={d.color} />)}</Bar></BarChart></Chart>
        </Card>
      </div>
    </>
  );
}
