import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, Empty, KV, RiskBadge, Select, StatusPill, Tabs, inputCls } from '../components/common/ui';
import FactorBars from '../components/common/FactorBars';
import RiskRing from '../components/charts/RiskRing';
import DataTable from '../components/tables/DataTable';
import { txnColumns } from '../components/dashboard/LiveTransactions';
import { useApp } from '../context/AppContext';
import { INVESTIGATORS, entityById, explainEntity, transactions } from '../data/mockData';
import type { CaseStatus } from '../types';
import { fmtDate, fmtDateTime } from '../utils';

export default function CaseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { cases, alerts, updateCase, addNote, openTxn, openExplanation } = useApp();
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const c = cases.find((x) => x.id === id);

  if (!c) return <Empty title="Case not found" hint="It may have been removed. Return to the cases list." />;
  const e = entityById(c.entityId)!;
  const ex = explainEntity(e);
  const txns = transactions.filter((t) => t.entityId === e.id);
  const related = alerts.filter((a) => a.entityId === e.id);

  const submitNote = () => { if (note.trim()) { addNote(c.id, note.trim()); setNote(''); } };

  return (
    <>
      <Link to="/cases" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All cases</Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{c.id}</h1><StatusPill status={c.status} /><StatusPill status={c.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-600">{c.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select className="!w-auto" aria-label="Status" value={c.status} onChange={(ev) => updateCase(c.id, { status: ev.target.value as CaseStatus })}>
            {['Open', 'In Progress', 'Under Review', 'Closed'].map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select className="!w-auto" aria-label="Assignee" value={c.assignedTo} onChange={(ev) => updateCase(c.id, { assignedTo: ev.target.value })}>
            {INVESTIGATORS.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Button variant="primary" disabled={c.status === 'Closed'} onClick={() => updateCase(c.id, { status: 'Closed' })}>Close case</Button>
        </div>
      </div>

      <Card bodyClass="p-0">
        <div className="px-4 pt-1">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'transactions', label: 'Transaction history', count: txns.length },
            { id: 'risk', label: 'Risk explanation' },
            { id: 'notes', label: 'Investigation notes', count: c.notes.length },
            { id: 'timeline', label: 'Timeline', count: c.timeline.length },
            { id: 'alerts', label: 'Related alerts', count: related.length },
          ]} />
        </div>

        {tab === 'overview' && (
          <div className="grid gap-6 p-4 lg:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">Case overview</h3>
              <p className="mb-3 text-sm text-slate-600">{c.description || 'No description provided.'}</p>
              <dl>
                <KV label="Risk score"><RiskBadge score={c.riskScore} /></KV>
                <KV label="Assigned to">{c.assignedTo}</KV>
                <KV label="Last updated">{fmtDate(c.updatedOn)}</KV>
              </dl>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-slate-900">Entity information</h3>
              <dl>
                <KV label="Name">{e.name}</KV><KV label="Entity ID">{e.id}</KV><KV label="Type">{e.type}</KV>
                <KV label="Country">{e.country}</KV><KV label="Account">{e.account}</KV><KV label="Connections">{e.connections}</KV>
              </dl>
              <Button className="mt-3" onClick={() => nav(`/entities/${e.id}`)}>View entity profile</Button>
            </div>
          </div>
        )}

        {tab === 'transactions' && (
          <DataTable compact columns={txnColumns} rows={txns} rowKey={(t) => t.id} pageSize={8} onRowClick={openTxn} emptyTitle="No transactions recorded for this entity" />
        )}

        {tab === 'risk' && (
          <div className="grid gap-6 p-4 md:grid-cols-[auto_1fr]">
            <RiskRing score={e.riskScore} size={120} />
            <div>
              <p className="mb-4 text-sm text-slate-700">{ex.summary}</p>
              <FactorBars factors={ex.factors} score={e.riskScore} />
              <Button className="mt-4" onClick={() => openExplanation(e.id)}>View full explanation</Button>
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div className="p-4">
            <textarea className={inputCls} rows={3} value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Add an investigation note" aria-label="Investigation note" />
            <div className="mt-2 flex justify-end"><Button variant="primary" disabled={!note.trim()} onClick={submitNote}>Add note</Button></div>
            <ul className="mt-4 space-y-3">
              {c.notes.map((n) => (
                <li key={n.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm text-slate-800">{n.text}</p>
                  <p className="mt-1.5 text-xs text-slate-500">{n.author} · {fmtDateTime(n.at)}</p>
                </li>
              ))}
              {!c.notes.length && <Empty title="No notes yet" hint="Record findings, requests and decisions as you investigate." />}
            </ul>
          </div>
        )}

        {tab === 'timeline' && (
          <ol className="space-y-5 p-4">
            {c.timeline.map((t) => (
              <li key={t.id} className="relative border-l-2 border-brand-100 pl-5">
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600" />
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                <p className="text-sm text-slate-600">{t.detail}</p>
                <p className="mt-0.5 text-xs text-slate-400">{fmtDateTime(t.at)}</p>
              </li>
            ))}
          </ol>
        )}

        {tab === 'alerts' && (
          <ul className="divide-y divide-slate-100">
            {related.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <RiskBadge score={a.riskScore} />
                <span className="font-medium text-slate-900">{a.id}</span>
                <span className="min-w-0 flex-1 text-slate-600">{a.reason}</span>
                <StatusPill status={a.status} />
                <span className="text-xs text-slate-500">{fmtDateTime(a.detectedAt)}</span>
              </li>
            ))}
            {!related.length && <Empty title="No related alerts" />}
          </ul>
        )}
      </Card>
    </>
  );
}
