import { useNavigate } from 'react-router-dom';
import { Drawer } from '../common/Overlays';
import { Button, KV, LevelDot, RiskBadge, StatusPill } from '../common/ui';
import FactorBars from '../common/FactorBars';
import { useApp } from '../../context/AppContext';
import { entityById } from '../../data/mockData';
import { fmtDateTime, inr } from '../../utils';

export default function TransactionDrawer() {
  const { txn, openTxn, openNewCase, notify } = useApp();
  const nav = useNavigate();
  if (!txn) return null;
  const close = () => openTxn(null);
  return (
    <Drawer
      open onClose={close} title={`Transaction ${txn.id}`}
      footer={
        <>
          <Button onClick={() => { notify(`${txn.id} marked as cleared`); close(); }}>Mark as cleared</Button>
          <Button variant="primary" onClick={() => { const id = txn.entityId; close(); openNewCase(id); }}>Create case</Button>
        </>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <RiskBadge score={txn.riskScore} />
        <LevelDot level={txn.status} />
        <StatusPill status={txn.review} />
      </div>
      <dl>
        <KV label="Transaction ID">{txn.id}</KV>
        <KV label="Amount">{inr(txn.amount)}</KV>
        <KV label="Sender">{txn.sender}</KV>
        <KV label="Receiver">{txn.receiver}</KV>
        <KV label="Source">{txn.source}</KV>
        <KV label="Destination">{txn.destination}</KV>
        <KV label="Timestamp">{fmtDateTime(txn.timestamp)}</KV>
        <KV label="Risk score">{txn.riskScore} / 100</KV>
        <KV label="Risk level">{txn.status}</KV>
      </dl>
      <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-900">Risk factors</h3>
      <FactorBars factors={txn.factors} score={txn.riskScore} />
      <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-900">Related entities</h3>
      <ul className="space-y-1.5">
        {txn.relatedEntities.map((id) => {
          const e = entityById(id);
          return e ? (
            <li key={id}>
              <button onClick={() => { close(); nav(`/entities/${id}`); }} className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">
                <span><span className="font-medium text-slate-900">{e.name}</span><span className="ml-2 text-xs text-slate-500">{e.id}</span></span>
                <RiskBadge score={e.riskScore} />
              </button>
            </li>
          ) : null;
        })}
      </ul>
    </Drawer>
  );
}
