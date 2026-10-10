import { riskLevel, riskTone } from '../../utils';

export default function RiskRing({ score, size = 96, label = 'Risk Score', sub }: { score: number; size?: number; label?: string; sub?: string }) {
  const r = 40, c = 2 * Math.PI * r;
  const color = riskTone[riskLevel(score)].hex;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label} ${score}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E9F2" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span className="font-semibold tabular-nums" style={{ color, fontSize: size * 0.3 }}>{score}</span>
        <span className="text-slate-500" style={{ fontSize: Math.max(9, size * 0.1) }}>{sub ?? label}</span>
      </div>
    </div>
  );
}
