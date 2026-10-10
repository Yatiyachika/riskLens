import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, Empty, KV, RiskBadge, StatusPill, Tabs } from '../components/common/ui';
import FactorBars from '../components/common/FactorBars';
import RiskRing from '../components/charts/RiskRing';
import NetworkGraph from '../components/charts/NetworkGraph';
import DataTable from '../components/tables/DataTable';
import { txnColumns } from '../components/dashboard/LiveTransactions';
import { caseColumns } from '../components/dashboard/CaseManagement';
import { useApp } from '../context/AppContext';
import { egoGraph, entityById, explainEntity, transactions } from '../data/mockData';
import { fmtDateTime } from '../utils';

export default function EntityProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { alerts, cases, openTxn, openExplanation, openNewCase } = useApp();
  const [tab, setTab] = useState('overview');
  const e = id ? entityById(id) : undefined;
  const [sel, setSel] = useState<string | undefined>(undefined);

  const txns = useMemo(() => transactions.filter((t) => t.entityId === id), [id]);
  if (!e) return <Empty title="Entity not found" hint="Check the entity ID and try again." />;

  const ex = explainEntity(e);
  const graph = egoGraph(e);
  const myAlerts = alerts.filter((a) => a.entityId === e.id);
  const myCases = cases.filter((c) => c.entityId === e.id);
  const countries = Object.entries(
    txns.reduce<Record<string, number>>((m, t) => { m[t.destination] = (m[t.destination] ?? 0) + 1; return m; }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const focus = entityById(sel ?? e.id)!;

  return (
    <>
      <Link to="/entities" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All entities</Link>
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-5">
          <RiskRing score={e.riskScore} size={96} />
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold text-slate-900">{e.name}</h1><StatusPill status={e.status} /></div>
            <p className="mt-1 text-sm text-slate-500">{e.id} · {e.type} · {e.country} · Account {e.account}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openExplanation(e.id)}>View explanation</Button>
            <Button variant="primary" onClick={() => openNewCase(e.id)}>Create case</Button>
          </div>
        </div>
      </Card>

      <Card bodyClass="p-0">
        <div className="px-4 pt-1">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'transactions', label: 'Transaction history', count: txns.length },
            { id: 'connections', label: 'Connections', count: e.connected.length },
            { id: 'alerts', label: 'Alerts', count: myAlerts.length },
            { id: 'cases', label: 'Cases', count: myCases.length },
          ]} />
        </div>

        {tab === 'overview' && (
          <div className="grid gap-6 p-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">AI risk explanation</h3>
              <p className="mb-4 text-sm text-slate-600">{ex.summary}</p>
              <FactorBars factors={ex.factors} score={e.riskScore} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Countries transacted with</h3>
              {countries.length ? (
                <ul className="space-y-2 text-sm">
                  {countries.slice(0, 6).map(([c, n]) => (
                    <li key={c} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-slate-700">{c}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-brand-500" style={{ width: `${(n / countries[0][1]) * 100}%` }} /></span>
                      <span className="w-6 text-right tabular-nums text-slate-500">{n}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-slate-500">No recent cross-border activity.</p>}
              <dl className="mt-5">
                <KV label="Connections">{e.connections}</KV><KV label="Open alerts">{myAlerts.filter((a) => a.status !== 'Resolved').length}</KV><KV label="Cases">{myCases.length}</KV>
              </dl>
            </div>
          </div>
        )}

        {tab === 'transactions' && <DataTable compact columns={txnColumns} rows={txns} rowKey={(t) => t.id} pageSize={8} onRowClick={openTxn} emptyTitle="No transactions for this entity" />}

        {tab === 'connections' && (
          <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-2">
              <NetworkGraph nodes={graph.nodes} edges={graph.edges} selectedId={sel ?? e.id} onSelect={setSel} />
            </div>
            <div>
              <div className="mb-3 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{focus.name}</p>
                <p className="mb-2 text-xs text-slate-500">{focus.id} · {focus.country}</p>
                <RiskBadge score={focus.riskScore} />
                {focus.id !== e.id && <Button size="sm" className="mt-3 w-full" onClick={() => { setSel(undefined); setTab('overview'); nav(`/entities/${focus.id}`); }}>Open profile</Button>}
              </div>
              <ul className="space-y-1.5">
                {graph.nodes.slice(1).map((n) => { const x = entityById(n.id)!; return (
                  <li key={n.id}><button onClick={() => setSel(n.id)} className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"><span className="truncate">{x.name}</span><RiskBadge score={x.riskScore} /></button></li>
                ); })}
              </ul>
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <ul className="divide-y divide-slate-100">
            {myAlerts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <RiskBadge score={a.riskScore} /><span className="font-medium">{a.id}</span>
                <span className="min-w-0 flex-1 text-slate-600">{a.reason}</span><StatusPill status={a.status} />
                <span className="text-xs text-slate-500">{fmtDateTime(a.detectedAt)}</span>
              </li>
            ))}
            {!myAlerts.length && <Empty title="No alerts for this entity" />}
          </ul>
        )}

        {tab === 'cases' && <DataTable compact columns={caseColumns} rows={myCases} rowKey={(c) => c.id} onRowClick={(c) => nav(`/cases/${c.id}`)} emptyTitle="No cases opened for this entity" />}
      </Card>
    </>
  );
}
