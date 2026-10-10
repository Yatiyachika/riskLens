import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Card, RiskBadge, StatusPill } from '../common/ui';
import DataTable from '../tables/DataTable';
import type { Column } from '../tables/DataTable';
import { useApp } from '../../context/AppContext';
import type { Case } from '../../types';
import { fmtDate } from '../../utils';

export const caseColumns: Column<Case>[] = [
  { key: 'id', header: 'Case ID', render: (c) => <span className="font-medium text-slate-900">{c.id}</span>, sortValue: (c) => c.id },
  { key: 'ent', header: 'Entity ID', render: (c) => c.entityId, sortValue: (c) => c.entityId },
  { key: 'risk', header: 'Risk Score', render: (c) => <RiskBadge score={c.riskScore} />, sortValue: (c) => c.riskScore },
  { key: 'status', header: 'Status', render: (c) => <StatusPill status={c.status} />, sortValue: (c) => c.status },
  { key: 'who', header: 'Assigned To', render: (c) => c.assignedTo, sortValue: (c) => c.assignedTo },
  { key: 'upd', header: 'Updated On', render: (c) => fmtDate(c.updatedOn), sortValue: (c) => c.updatedOn },
];

export default function CaseManagement() {
  const { cases, openNewCase } = useApp();
  const nav = useNavigate();
  const active = cases.filter((c) => c.status !== 'Closed').slice(0, 4);
  return (
    <Card
      title="Case Management" subtitle="Active cases" bodyClass="p-0"
      action={<Button variant="primary" size="sm" onClick={() => openNewCase()}><Plus className="h-3.5 w-3.5" />New Case</Button>}
    >
      <DataTable compact columns={caseColumns} rows={active} rowKey={(c) => c.id} onRowClick={(c) => nav(`/cases/${c.id}`)} />
      <div className="border-t border-slate-100 px-4 py-2.5 text-right text-xs"><Link to="/cases" className="font-medium text-brand-700 hover:underline">View all cases</Link></div>
    </Card>
  );
}
