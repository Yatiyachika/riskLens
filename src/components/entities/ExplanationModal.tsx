import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Overlays';
import { Button, KV, Pill } from '../common/ui';
import FactorBars from '../common/FactorBars';
import RiskRing from '../charts/RiskRing';
import { useApp } from '../../context/AppContext';
import { entityById, explainEntity } from '../../data/mockData';
import { riskLevel } from '../../utils';

export default function ExplanationModal() {
  const { explainId, openExplanation, openNewCase } = useApp();
  const nav = useNavigate();
  const entity = explainId ? entityById(explainId) : undefined;
  const ex = entity ? explainEntity(entity) : null;
  return (
    <Modal
      open={!!entity} onClose={() => openExplanation(null)} width="max-w-2xl"
      title={entity ? `Risk explanation · ${entity.name}` : ''}
      footer={entity && (
        <>
          <Button onClick={() => { openExplanation(null); nav(`/entities/${entity.id}`); }}>View entity</Button>
          <Button variant="primary" onClick={() => { openExplanation(null); openNewCase(entity.id); }}>Open case</Button>
        </>
      )}
    >
      {entity && ex && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-5">
            <RiskRing score={entity.riskScore} size={104} sub={`${riskLevel(entity.riskScore)} Risk`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">{ex.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2"><Pill tone="blue">{ex.model}</Pill><Pill>{entity.id}</Pill></div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Contribution by risk factor</h3>
            <FactorBars factors={ex.factors} score={entity.riskScore} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Key findings</h3>
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-slate-600">{ex.findings.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Recommended actions</h3>
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-slate-600">{ex.actions.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          </div>
          <dl className="rounded-lg bg-slate-50 px-4 py-1">
            <KV label="Model">{ex.model}</KV>
            <KV label="Model version">gnn-aml-2.4.1</KV>
            <KV label="Graph window">Last 90 days · 2-hop subgraph</KV>
          </dl>
        </div>
      )}
    </Modal>
  );
}
