import { Drawer } from '../common/Overlays';
import { KV, StatusPill } from '../common/ui';
import RiskRing from '../charts/RiskRing';
import AlertActions from './AlertActions';
import { useApp } from '../../context/AppContext';
import { entityById } from '../../data/mockData';
import { fmtDateTime } from '../../utils';

export default function AlertDrawer({ alertId, onClose }: { alertId: string | null; onClose: () => void }) {
  const { alerts } = useApp();
  const a = alerts.find((x) => x.id === alertId);
  if (!a) return null;
  const e = entityById(a.entityId);
  return (
    <Drawer open onClose={onClose} title={`Alert ${a.id}`}>
      <div className="mb-5 flex items-center gap-4">
        <RiskRing score={a.riskScore} />
        <div><StatusPill status={a.status} /><p className="mt-2 text-sm text-slate-700">{a.reason}</p></div>
      </div>
      <dl className="mb-6">
        <KV label="Entity">{e ? `${e.name} (${e.id})` : a.entityId}</KV>
        <KV label="Matched with">{a.matchedWith}</KV>
        <KV label="Country">{a.country}</KV>
        <KV label="Detected on">{fmtDateTime(a.detectedAt)}</KV>
        <KV label="Entity risk score">{e?.riskScore ?? '—'}</KV>
      </dl>
      <AlertActions alert={a} onDone={onClose} />
    </Drawer>
  );
}
