import { Button, Card } from '../common/ui';
import FactorBars from '../common/FactorBars';
import RiskRing from '../charts/RiskRing';
import { useApp } from '../../context/AppContext';
import { entityById, explainEntity } from '../../data/mockData';
import { riskLevel } from '../../utils';

export default function RiskExplanation({ entityId }: { entityId: string }) {
  const { openExplanation } = useApp();
  const e = entityById(entityId)!;
  const ex = explainEntity(e);
  return (
    <Card title="Risk Explanation (Explainable AI)" subtitle={`${e.name} · ${e.id}`}>
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Risk Score Breakdown</h3>
          <div className="flex flex-wrap items-start gap-5">
            <RiskRing score={e.riskScore} size={104} sub={`${riskLevel(e.riskScore)} Risk`} />
            <div className="min-w-[200px] flex-1">
              <p className="mb-2 text-xs font-medium text-slate-500">Risk Factors</p>
              <FactorBars factors={ex.factors} score={e.riskScore} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-xs text-slate-500">AI Model Used</p>
          <p className="text-sm font-semibold text-slate-900">{ex.model}</p>
          <p className="mt-3 text-xs text-slate-500">Explanation</p>
          <p className="text-sm leading-relaxed text-slate-700">{ex.summary}</p>
          <Button variant="primary" className="mt-4 w-full" onClick={() => openExplanation(e.id)}>View Full Explanation</Button>
        </div>
      </div>
    </Card>
  );
}
