import { useMemo, useState } from 'react';
import { Button, Card, SearchInput, Select, inputCls } from '../components/common/ui';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/tables/DataTable';
import type { Column } from '../components/tables/DataTable';
import { txnColumns } from '../components/dashboard/LiveTransactions';
import { StatusPill } from '../components/common/ui';
import { useApp } from '../context/AppContext';
import { COUNTRIES, transactions } from '../data/mockData';
import type { Transaction } from '../types';
import { dayKey, downloadFile, inr, riskLevel, toCsv } from '../utils';

const amountBands: Record<string, [number, number]> = {
  any: [0, Infinity], lt50: [0, 50000], mid: [50000, 200000], gt200: [200000, Infinity],
};

export default function Transactions() {
  const { openTxn, notify } = useApp();
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [country, setCountry] = useState('All');
  const [risk, setRisk] = useState('All');
  const [review, setReview] = useState('All');
  const [amount, setAmount] = useState('any');

  const rows = useMemo(() => transactions.filter((t) => {
    const hay = `${t.id} ${t.sender} ${t.receiver} ${t.entityId}`.toLowerCase();
    const [lo, hi] = amountBands[amount];
    const d = dayKey(t.timestamp);
    return (!q || hay.includes(q.toLowerCase()))
      && (!from || d >= from) && (!to || d <= to)
      && (country === 'All' || t.destination === country || t.source === country)
      && (risk === 'All' || riskLevel(t.riskScore) === risk)
      && (review === 'All' || t.review === review)
      && t.amount >= lo && t.amount < hi;
  }), [q, from, to, country, risk, review, amount]);

  const columns: Column<Transaction>[] = [
    ...txnColumns.slice(0, 6),
    { key: 'review', header: 'Review', render: (t) => <StatusPill status={t.review} />, sortValue: (t) => t.review },
    txnColumns[6],
  ];

  const total = rows.reduce((s, t) => s + t.amount, 0);
  const flagged = rows.filter((t) => t.status === 'High').length;
  const reset = () => { setQ(''); setFrom(''); setTo(''); setCountry('All'); setRisk('All'); setReview('All'); setAmount('any'); };

  return (
    <>
      <PageHeader
        title="Transactions" subtitle="Monitor and review payment activity"
        actions={<Button onClick={() => { downloadFile('transactions.csv', toCsv(rows.map((t) => ({ id: t.id, time: t.timestamp, source: t.source, destination: t.destination, amount: t.amount, risk: t.riskScore, review: t.review }))) ); notify('Exported transactions.csv'); }}>Export CSV</Button>}
      />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[['Matching', rows.length.toLocaleString()], ['Total value', inr(total)], ['High risk', String(flagged)]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-card">
            <p className="text-xs text-slate-500">{l}</p><p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-slate-900">{v}</p>
          </div>
        ))}
      </div>
      <Card bodyClass="p-0">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput className="sm:col-span-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transaction ID, sender or receiver" aria-label="Search transactions" />
          <input type="date" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          <input type="date" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
            <option value="All">All countries</option>{['India', ...COUNTRIES].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={risk} onChange={(e) => setRisk(e.target.value)} aria-label="Risk score">
            <option value="All">All risk scores</option><option value="High">High (70–100)</option><option value="Medium">Medium (40–69)</option><option value="Low">Low (0–39)</option>
          </Select>
          <Select value={review} onChange={(e) => setReview(e.target.value)} aria-label="Status">
            <option value="All">All statuses</option><option>Pending</option><option>Flagged</option><option>Cleared</option><option>Blocked</option>
          </Select>
          <div className="flex gap-2">
            <Select value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Amount">
              <option value="any">Any amount</option><option value="lt50">Under ₹50,000</option><option value="mid">₹50,000 – ₹2,00,000</option><option value="gt200">Over ₹2,00,000</option>
            </Select>
            <Button onClick={reset}>Reset</Button>
          </div>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} pageSize={10} onRowClick={openTxn} defaultSort={{ key: 'time', dir: 'desc' }} emptyTitle="No transactions match your filters" />
      </Card>
    </>
  );
}
