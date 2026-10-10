import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button, Card, LevelDot, Popover, RiskBadge, Toggle } from '../common/ui';
import DataTable from '../tables/DataTable';
import type { Column } from '../tables/DataTable';
import { useApp } from '../../context/AppContext';
import { liveSeed, makeLiveTransaction } from '../../data/mockData';
import type { RiskLevel, Transaction } from '../../types';
import { fmtTime, inr } from '../../utils';

export const txnColumns: Column<Transaction>[] = [
  { key: 'time', header: 'Time', render: (t) => <span className="tabular-nums">{fmtTime(t.timestamp)}</span>, sortValue: (t) => t.timestamp },
  { key: 'id', header: 'Transaction ID', render: (t) => <span className="font-medium text-slate-900">{t.id}</span>, sortValue: (t) => t.id },
  { key: 'src', header: 'Source', render: (t) => t.source, sortValue: (t) => t.source },
  { key: 'dst', header: 'Destination', render: (t) => t.destination, sortValue: (t) => t.destination },
  { key: 'amt', header: 'Amount', align: 'right', render: (t) => inr(t.amount), sortValue: (t) => t.amount },
  { key: 'risk', header: 'Risk Score', render: (t) => <RiskBadge score={t.riskScore} />, sortValue: (t) => t.riskScore },
  { key: 'status', header: 'Status', render: (t) => <LevelDot level={t.status} /> },
];

const levels: RiskLevel[] = ['High', 'Medium', 'Low'];

export default function LiveTransactions() {
  const { openTxn } = useApp();
  const [rows, setRows] = useState<Transaction[]>(liveSeed);
  const [paused, setPaused] = useState(false);
  const [show, setShow] = useState<Record<RiskLevel, boolean>>({ High: true, Medium: true, Low: true });

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setRows((r) => [makeLiveTransaction(), ...r].slice(0, 12)), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const visible = rows.filter((r) => show[r.status]).slice(0, 5);

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          Live Transactions
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${paused ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${paused ? 'bg-slate-400' : 'animate-pulse bg-emerald-500'}`} />
            {paused ? 'Paused' : 'Live'}
          </span>
        </span>
      }
      subtitle="Real-time Transaction Feed"
      action={
        <Popover trigger={(_, t) => <Button size="sm" onClick={t}><Filter className="h-3.5 w-3.5" />Filters</Button>}>
          {() => (
            <div className="space-y-3 text-sm">
              <p className="text-xs font-semibold text-slate-900">Risk level</p>
              {levels.map((l) => (
                <label key={l} className="flex items-center gap-2 text-slate-700">
                  <input type="checkbox" checked={show[l]} onChange={() => setShow({ ...show, [l]: !show[l] })} className="accent-brand-600" /> {l}
                </label>
              ))}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-700">Pause live feed</span>
                <Toggle checked={paused} onChange={setPaused} label="Pause live feed" />
              </div>
            </div>
          )}
        </Popover>
      }
      bodyClass="p-0"
    >
      <DataTable compact columns={txnColumns} rows={visible} rowKey={(t) => t.id} onRowClick={openTxn} emptyTitle="No transactions match the filters" />
    </Card>
  );
}
