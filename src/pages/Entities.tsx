import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, RiskBadge, SearchInput, Select, StatusPill } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import type { Column } from '../components/tables/DataTable';
import { entities, transactions } from '../data/mockData';
import type { Entity } from '../types';

export default function Entities() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [field, setField] = useState('all');
  const [type, setType] = useState('All');

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return entities.filter((e) => {
      if (type !== 'All' && e.type !== type) return false;
      if (!s) return true;
      const txIds = transactions.filter((t) => t.entityId === e.id).map((t) => t.id.toLowerCase());
      const match: Record<string, boolean> = {
        id: e.id.toLowerCase().includes(s),
        name: e.name.toLowerCase().includes(s),
        country: e.country.toLowerCase().includes(s),
        account: e.account.toLowerCase().includes(s),
        txn: txIds.some((t) => t.includes(s)),
      };
      return field === 'all' ? Object.values(match).some(Boolean) : match[field];
    });
  }, [q, field, type]);

  const columns: Column<Entity>[] = [
    { key: 'id', header: 'Entity ID', render: (e) => <span className="font-medium text-slate-900">{e.id}</span>, sortValue: (e) => e.id },
    { key: 'name', header: 'Name', render: (e) => e.name, sortValue: (e) => e.name },
    { key: 'type', header: 'Type', render: (e) => e.type, sortValue: (e) => e.type },
    { key: 'country', header: 'Country', render: (e) => e.country, sortValue: (e) => e.country },
    { key: 'risk', header: 'Risk Score', render: (e) => <RiskBadge score={e.riskScore} />, sortValue: (e) => e.riskScore },
    { key: 'conn', header: 'Connections', align: 'right', render: (e) => e.connections, sortValue: (e) => e.connections },
    { key: 'status', header: 'Status', render: (e) => <StatusPill status={e.status} />, sortValue: (e) => e.status },
  ];

  return (
    <>
      <PageHeader title="Entities" subtitle="Investigate people and organisations across the network" />
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <SearchInput value={q} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} placeholder="Search entities" aria-label="Search entities" />
          <Select value={field} onChange={(e) => setField(e.target.value)} aria-label="Search by">
            <option value="all">Search by: Any field</option><option value="id">Entity ID</option><option value="name">Name</option>
            <option value="country">Country</option><option value="account">Account</option><option value="txn">Transaction ID</option>
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
            <option value="All">All types</option><option>Individual</option><option>Company</option>
          </Select>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} pageSize={10} onRowClick={(e) => nav(`/entities/${e.id}`)} defaultSort={{ key: 'risk', dir: 'desc' }} emptyTitle="No entities found" />
      </Card>
    </>
  );
}
