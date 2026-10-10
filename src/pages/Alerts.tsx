import { useMemo, useState } from 'react';
import { Button, Card, RiskBadge, SearchInput, Select, StatusPill } from '../components/common/ui';
import { LevelDot } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import type { Column } from '../components/tables/DataTable';
import AlertDrawer from '../components/alerts/AlertDrawer';
import { useApp } from '../context/AppContext';
import { entityById } from '../data/mockData';
import type { Alert } from '../types';
import { dayKey, fmtDateTime, riskLevel } from '../utils';

export default function Alerts() {
  const { alerts, closeAlert } = useApp();
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('All');
  const [status, setStatus] = useState('All');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(() => alerts.filter((a) => {
    const name = entityById(a.entityId)?.name ?? '';
    const hay = `${a.id} ${a.entityId} ${name} ${a.reason} ${a.country}`.toLowerCase();
    return (!q || hay.includes(q.toLowerCase()))
      && (risk === 'All' || riskLevel(a.riskScore) === risk)
      && (status === 'All' || a.status === status)
      && (!date || dayKey(a.detectedAt) === date);
  }), [alerts, q, risk, status, date]);

  const columns: Column<Alert>[] = [
    { key: 'id', header: 'Alert ID', render: (a) => <span className="font-medium text-slate-900">{a.id}</span>, sortValue: (a) => a.id },
    { key: 'ent', header: 'Entity', render: (a) => <span><span className="block text-slate-900">{entityById(a.entityId)?.name}</span><span className="text-xs text-slate-500">{a.entityId}</span></span>, sortValue: (a) => a.entityId },
    { key: 'risk', header: 'Risk Score', render: (a) => <span className="inline-flex items-center gap-2"><RiskBadge score={a.riskScore} /><LevelDot level={riskLevel(a.riskScore)} /></span>, sortValue: (a) => a.riskScore },
    { key: 'reason', header: 'Reason', render: (a) => <span className="block max-w-[280px] truncate" title={a.reason}>{a.reason}</span>, sortValue: (a) => a.reason },
    { key: 'country', header: 'Country', render: (a) => a.country, sortValue: (a) => a.country },
    { key: 'at', header: 'Detected At', render: (a) => fmtDateTime(a.detectedAt), sortValue: (a) => a.detectedAt },
    { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} />, sortValue: (a) => a.status },
    {
      key: 'act', header: 'Actions',
      render: (a) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" onClick={() => setSelected(a.id)}>Details</Button>
          <Button size="sm" disabled={a.status === 'Resolved'} onClick={() => closeAlert(a.id)}>Close</Button>
        </div>
      ),
    },
  ];

  const reset = () => { setQ(''); setRisk('All'); setStatus('All'); setDate(''); };

  return (
    <>
      <PageHeader title="Alerts" subtitle={`${alerts.filter((a) => a.status === 'Open').length} open alerts need review`} />
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alert, entity, reason or country" aria-label="Search alerts" />
          <Select value={risk} onChange={(e) => setRisk(e.target.value)} aria-label="Risk level">
            <option value="All">All risk levels</option><option>High</option><option>Medium</option><option>Low</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="All">All statuses</option><option>Open</option><option>Investigating</option><option>Resolved</option>
          </Select>
          <input type="date" value={date} min="2025-05-12" max="2025-05-18" onChange={(e) => setDate(e.target.value)} aria-label="Detected on"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <Button onClick={reset}>Reset</Button>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} pageSize={8} onRowClick={(a) => setSelected(a.id)} defaultSort={{ key: 'at', dir: 'desc' }} emptyTitle="No alerts match your filters" />
      </Card>
      <AlertDrawer alertId={selected} onClose={() => setSelected(null)} />
    </>
  );
}
