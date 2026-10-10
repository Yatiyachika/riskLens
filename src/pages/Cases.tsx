import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Card, RiskBadge, Select, StatusPill, Tabs } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import type { Column } from '../components/tables/DataTable';
import { caseColumns } from '../components/dashboard/CaseManagement';
import { useApp } from '../context/AppContext';
import { INVESTIGATORS, entityById } from '../data/mockData';
import type { Case } from '../types';

export default function Cases() {
  const { cases, openNewCase } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState('active');
  const [who, setWho] = useState('All');
  const [prio, setPrio] = useState('All');

  const groups: Record<string, (c: Case) => boolean> = {
    active: (c) => c.status === 'Open' || c.status === 'In Progress',
    review: (c) => c.status === 'Under Review',
    closed: (c) => c.status === 'Closed',
    all: () => true,
  };
  const rows = useMemo(() => cases.filter((c) => groups[tab](c) && (who === 'All' || c.assignedTo === who) && (prio === 'All' || c.priority === prio)),
    [cases, tab, who, prio]);

  const columns: Column<Case>[] = [
    caseColumns[0],
    { key: 'title', header: 'Title', render: (c) => <span className="block max-w-[260px] truncate" title={c.title}>{c.title}</span>, sortValue: (c) => c.title },
    { key: 'ent', header: 'Entity', render: (c) => entityById(c.entityId)?.name ?? c.entityId, sortValue: (c) => c.entityId },
    { key: 'prio', header: 'Priority', render: (c) => <StatusPill status={c.priority} />, sortValue: (c) => ['Low', 'Medium', 'High', 'Critical'].indexOf(c.priority) },
    ...caseColumns.slice(2),
  ];

  return (
    <>
      <PageHeader title="Cases" subtitle="Track investigations from alert to resolution"
        actions={<Button variant="primary" onClick={() => openNewCase()}><Plus className="h-4 w-4" />New Case</Button>} />
      <Card bodyClass="p-0">
        <div className="px-4 pt-1">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'active', label: 'Active', count: cases.filter(groups.active).length },
            { id: 'review', label: 'Under review', count: cases.filter(groups.review).length },
            { id: 'closed', label: 'Closed', count: cases.filter(groups.closed).length },
            { id: 'all', label: 'All', count: cases.length },
          ]} />
        </div>
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:max-w-xl">
          <Select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Assigned investigator">
            <option value="All">All investigators</option>{INVESTIGATORS.map((i) => <option key={i}>{i}</option>)}
          </Select>
          <Select value={prio} onChange={(e) => setPrio(e.target.value)} aria-label="Priority">
            <option value="All">All priorities</option>{['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(c) => c.id} pageSize={8} onRowClick={(c) => nav(`/cases/${c.id}`)} emptyTitle="No cases in this view" />
      </Card>
    </>
  );
}
