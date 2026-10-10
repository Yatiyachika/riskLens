import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, KV } from '../common/ui';
import RiskRing from '../charts/RiskRing';
import AlertActions from '../alerts/AlertActions';
import { useApp } from '../../context/AppContext';
import { fmtDateTime } from '../../utils';

export default function HighRiskAlert() {
  const { alerts } = useApp();
  const a = alerts.find((x) => x.id === 'ALT-5001')!;
  const resolved = a.status === 'Resolved';
  return (
    <Card title="High Risk Alert" bodyClass="p-4">
      <div className={`overflow-hidden rounded-lg border ${resolved ? 'border-emerald-200' : 'border-red-200'}`}>
        <div className={`flex items-center gap-2 px-4 py-2.5 text-[15px] font-semibold ${resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {resolved ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {resolved ? 'Alert resolved' : 'High Risk Alert Detected'}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-4">
          <div className={resolved ? 'opacity-50' : ''}><RiskRing score={a.riskScore} size={108} /></div>
          <dl className="min-w-[220px] flex-1">
            <KV label="Entity ID">{a.entityId}</KV>
            <KV label="Reason">{a.reason}</KV>
            <KV label="Matched With">{a.matchedWith}</KV>
            <KV label="Country">{a.country}</KV>
            <KV label="Detected On">{fmtDateTime(a.detectedAt)}</KV>
          </dl>
        </div>
        <div className="border-t border-slate-100 px-4 py-3"><AlertActions alert={a} /></div>
      </div>
    </Card>
  );
}
