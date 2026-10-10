import type { RiskFactor } from '../../types';
import { riskLevel, riskTone } from '../../utils';

export default function FactorBars({ factors, score }: { factors: RiskFactor[]; score: number }) {
  const color = riskTone[riskLevel(score)].hex;
  return (
    <ul className="space-y-3">
      {factors.map((f) => (
        <li key={f.name}>
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span className="text-slate-700">{f.name}</span>
            <span className="font-medium tabular-nums text-slate-900">{f.score}/{f.max}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${(f.score / f.max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
