import { useState } from 'react';
import type { GraphEdge, GraphNode } from '../../types';
import { riskLevel, riskTone } from '../../utils';

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Lightweight interactive SVG graph. Hover highlights neighbours; click/Enter selects a node. */
export default function NetworkGraph({ nodes, edges, selectedId, onSelect, className = '' }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const active = hover ?? selectedId ?? null;
  const linked = (e: GraphEdge) => active && (e.from === active || e.to === active);

  return (
    <svg viewBox="0 0 460 330" className={`h-auto w-full ${className}`} role="group" aria-label="Entity relationship graph">
      {edges.map((e, i) => {
        const a = byId.get(e.from), b = byId.get(e.to);
        if (!a || !b) return null;
        const on = linked(e);
        return (
          <g key={i} opacity={active && !on ? 0.35 : 1}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? '#2F6BEB' : '#B6C2D9'} strokeWidth={on ? 1.8 : 1} />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} textAnchor="middle" fontSize="7.5" fill="#64748B"
              style={{ paintOrder: 'stroke' }} stroke="#fff" strokeWidth="3">{e.label}</text>
          </g>
        );
      })}
      {nodes.map((n) => {
        const t = riskTone[riskLevel(n.score)];
        const sel = n.id === selectedId;
        return (
          <g
            key={n.id} tabIndex={0} role="button" aria-label={`${n.label}, risk score ${n.score}`} aria-pressed={sel}
            className="cursor-pointer outline-none"
            onClick={() => onSelect?.(n.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect?.(n.id))}
            onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)} onBlur={() => setHover(null)}
          >
            {sel && <circle cx={n.x} cy={n.y} r={31} fill="none" stroke={t.hex} strokeWidth="1.5" strokeDasharray="3 3" />}
            <circle cx={n.x} cy={n.y} r={25} fill={t.hex} stroke="#fff" strokeWidth="3" />
            <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#fff">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
