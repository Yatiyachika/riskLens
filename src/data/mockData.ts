import type {
  Alert, Case, Entity, GraphEdge, GraphNode, Priority, ReviewStatus, RiskFactor, Transaction, User,
} from '../types';
import { riskLevel } from '../utils';

/* ---------- deterministic RNG so the demo data is stable ---------- */
let seed = 42;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];
const between = (a: number, b: number) => Math.round(a + rnd() * (b - a));
const iso = (day: number, h: number, m: number, s: number) =>
  `2025-05-${String(day).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

export const NOW = '2025-05-18T10:24:38';
export const CURRENT_USER: User = { name: 'Priya Sharma', email: 'priya.sharma@risklens.io', role: 'Senior Fraud Analyst' };
export const INVESTIGATORS = ['Investigator 1', 'Investigator 2', 'Investigator 3', 'Investigator 4'];
export const COUNTRIES = ['Singapore', 'UAE', 'Hong Kong', 'UK', 'USA', 'Iran', 'Russia', 'Germany', 'Cyprus', 'Panama', 'Nigeria', 'Turkey'];
export const HIGH_RISK_COUNTRIES = ['Iran', 'Russia', 'Panama', 'Nigeria'];

/* ---------- risk factors / explainability ---------- */
const ENTITY_FACTORS = ['High transaction velocity', 'Transactions to high-risk country', 'Linked to sanctioned entities', 'Unusual transaction pattern'];
const TXN_FACTORS = ['Amount above customer baseline', 'Destination jurisdiction risk', 'Counterparty watchlist proximity', 'Structuring / velocity pattern'];

export const buildFactors = (score: number, names = ENTITY_FACTORS, fixed?: number[]): RiskFactor[] => {
  let w = fixed;
  if (!w) {
    w = [0.35, 0.24, 0.24, 0.17].map((x) => Math.round(score * x));
    w[3] += score - w.reduce((a, b) => a + b, 0);
  }
  return names.map((name, i) => ({ name, score: w![i], max: 100 }));
};

/* ---------- entities ---------- */
const mk = (
  id: string, name: string, type: Entity['type'], country: string, riskScore: number, connections: number,
): Entity => ({
  id, name, type, country, riskScore, connections,
  status: riskScore >= 70 ? 'Flagged' : riskScore >= 40 ? 'Under Watch' : 'Active',
  account: 'AC' + String(between(100000000000, 999999999999)),
  connected: [],
});

const fixedEntities: Entity[] = [
  mk('ENT-2457901', 'Arjun Malhotra', 'Individual', 'Singapore', 85, 28),
  mk('ENT-9822150', 'Orion Capital FZE', 'Company', 'UAE', 75, 19),
  mk('ENT-7712235', 'Lotus Export Pte Ltd', 'Company', 'Singapore', 58, 14),
  mk('ENT-6522012', 'Kavya Menon', 'Individual', 'India', 42, 9),
  mk('ENT-3301874', 'Silverline Logistics', 'Company', 'UK', 28, 7),
  mk('ENT-1189045', 'Rahul Deshmukh', 'Individual', 'India', 22, 5),
  mk('ENT-5540672', 'Pacific Bridge Ltd', 'Company', 'Hong Kong', 33, 11),
];

const first = ['Anita', 'Sanjay', 'Meera', 'Dmitri', 'Layla', 'Chen', 'Omar', 'Sofia', 'Hiro', 'Neha', 'Tariq', 'Elena'];
const last = ['Kapoor', 'Iyer', 'Volkov', 'Haddad', 'Wong', 'Schmidt', 'Okafor', 'Reddy', 'Tanaka', 'Gupta', 'Petrov', 'Nair'];
const coA = ['Meridian', 'Atlas', 'Zenith', 'Harbor', 'Crescent', 'Nova', 'Summit', 'Blue Nile', 'Helios', 'Cobalt'];
const coB = ['Trading Co', 'Holdings', 'Capital LLC', 'Exports', 'Remit Services', 'Ventures'];

const genEntities: Entity[] = Array.from({ length: 23 }, (_, i) => {
  const isCo = i % 2 === 0;
  const score = pick([14, 19, 24, 31, 36, 44, 51, 63, 71, 78, 88]);
  return mk(
    `ENT-${between(1000000, 9999999)}`,
    isCo ? `${pick(coA)} ${pick(coB)}` : `${pick(first)} ${pick(last)}`,
    isCo ? 'Company' : 'Individual',
    pick(['India', ...COUNTRIES]),
    score,
    between(2, 24),
  );
});

export const entities: Entity[] = [...fixedEntities, ...genEntities];
export const entityById = (id: string) => entities.find((e) => e.id === id);

// wire up relationships
entities.forEach((e, i) => {
  if (i === 0) e.connected = fixedEntities.slice(1).map((x) => x.id);
  else {
    const set = new Set<string>([entities[0].id]);
    while (set.size < between(3, 5)) set.add(pick(entities).id);
    set.delete(e.id);
    e.connected = [...set];
  }
});

/* ---------- transactions ---------- */
const fixedTx: [string, string, string, string, number, number, number][] = [
  ['10:24:38', 'TXN8762910', 'India', 'Singapore', 245000, 85, 0],
  ['10:24:32', 'TXN8762100', 'India', 'UAE', 102000, 72, 1],
  ['10:24:21', 'TXN8762090', 'India', 'Hong Kong', 56000, 45, 6],
  ['10:24:11', 'TXN8762080', 'India', 'UK', 15000, 25, 4],
  ['10:24:03', 'TXN8762070', 'India', 'USA', 320000, 42, 3],
];

const reviewFor = (score: number): ReviewStatus =>
  riskLevel(score) === 'High' ? pick(['Flagged', 'Blocked', 'Pending'] as const)
    : riskLevel(score) === 'Medium' ? pick(['Pending', 'Flagged', 'Cleared'] as const)
      : pick(['Cleared', 'Cleared', 'Pending'] as const);

const buildTx = (
  id: string, timestamp: string, source: string, destination: string, amount: number, score: number, entity: Entity,
): Transaction => {
  const receiver = pick(entities.filter((e) => e.id !== entity.id));
  return {
    id, timestamp, source, destination, amount, riskScore: score, status: riskLevel(score),
    review: reviewFor(score), sender: entity.name, receiver: receiver.name, entityId: entity.id,
    factors: buildFactors(score, TXN_FACTORS), relatedEntities: [entity.id, receiver.id],
  };
};

const genTx: Transaction[] = Array.from({ length: 70 }, (_, i) => {
  const score = rnd() < 0.2 ? between(70, 98) : rnd() < 0.45 ? between(40, 69) : between(5, 39);
  return buildTx(
    `TXN${8761000 + i * 13}`,
    iso(between(12, 18), between(0, 9), between(0, 59), between(0, 59)),
    rnd() < 0.85 ? 'India' : pick(['UK', 'UAE', 'Singapore']),
    pick(COUNTRIES),
    Math.round((2000 + rnd() * 398000) / 100) * 100,
    score,
    pick(entities),
  );
});

export const transactions: Transaction[] = [
  ...fixedTx.map(([t, id, src, dst, amt, score, ei]) => buildTx(id, `2025-05-18T${t}`, src, dst, amt, score, entities[ei])),
  ...genTx,
].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

let liveCounter = 8762911;
export const makeLiveTransaction = (): Transaction => {
  const score = rnd() < 0.25 ? between(70, 96) : rnd() < 0.5 ? between(40, 69) : between(8, 39);
  const d = new Date();
  const ts = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  return buildTx(`TXN${liveCounter++}`, ts, 'India', pick(COUNTRIES), Math.round((5000 + rnd() * 395000) / 1000) * 1000, score, pick(entities));
};
export const liveSeed = transactions.slice(0, 5);

/* ---------- alerts ---------- */
const reasons = [
  'Multiple high-risk transactions to sanctioned country', 'Rapid movement of funds across linked accounts',
  'Structuring below reporting threshold', 'Counterparty matched on PEP watchlist',
  'Unusual spike in cross-border volume', 'Dormant account suddenly active', 'Shared device across unrelated entities',
];
const lists = ['Sanctions List', 'PEP Watchlist', 'Internal Watchlist', 'Adverse Media', 'No direct match'];

export const initialAlerts: Alert[] = [
  {
    id: 'ALT-5001', entityId: 'ENT-2457901', riskScore: 92, reason: reasons[0], matchedWith: 'Sanctions List',
    country: 'Iran', detectedAt: '2025-05-18T10:24:35', status: 'Open',
  },
  ...Array.from({ length: 29 }, (_, i): Alert => {
    const e = pick(entities);
    return {
      id: `ALT-${5002 + i}`, entityId: e.id,
      riskScore: Math.max(20, Math.min(99, e.riskScore + between(-8, 10))),
      reason: pick(reasons), matchedWith: pick(lists),
      country: rnd() < 0.4 ? pick(HIGH_RISK_COUNTRIES) : e.country,
      detectedAt: iso(between(12, 18), between(0, 10), between(0, 59), between(0, 59)),
      status: pick(['Open', 'Open', 'Investigating', 'Resolved'] as const),
    };
  }),
].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));

/* ---------- cases ---------- */
const caseTimeline = (id: string, at: string, status: string) => [
  { id: id + 't1', at, title: 'Case created', detail: 'Auto-generated from high-risk alert correlation.' },
  { id: id + 't2', at, title: 'Assigned', detail: 'Case routed to investigator by workload balancing.' },
  { id: id + 't3', at, title: `Status: ${status}`, detail: 'Current investigation stage.' },
];

const caseSeed: [string, string, string, Case['status'], string, Priority, string][] = [
  ['CASE-1001', 'Sanctioned-country transaction cluster', 'ENT-2457901', 'Open', 'Investigator 1', 'Critical', '2025-05-18'],
  ['CASE-1002', 'Layering through UAE shell accounts', 'ENT-9822150', 'In Progress', 'Investigator 2', 'High', '2025-05-18'],
  ['CASE-1003', 'Unusual export invoice patterns', 'ENT-7712235', 'Under Review', 'Investigator 3', 'Medium', '2025-05-17'],
  ['CASE-1004', 'Repeated sub-threshold remittances', 'ENT-6522012', 'Open', 'Investigator 1', 'Medium', '2025-05-17'],
  ['CASE-1005', 'PEP counterparty exposure', genEntities[2].id, 'In Progress', 'Investigator 4', 'High', '2025-05-16'],
  ['CASE-1006', 'Dormant account reactivation', genEntities[5].id, 'Under Review', 'Investigator 2', 'Medium', '2025-05-16'],
  ['CASE-1007', 'Shared device cluster', genEntities[8].id, 'Closed', 'Investigator 3', 'Low', '2025-05-14'],
  ['CASE-1008', 'Rapid pass-through of funds', genEntities[11].id, 'Closed', 'Investigator 1', 'Medium', '2025-05-13'],
  ['CASE-1009', 'Adverse media match', genEntities[14].id, 'Closed', 'Investigator 4', 'Low', '2025-05-12'],
  ['CASE-1010', 'High-volume trade-based activity', genEntities[17].id, 'Under Review', 'Investigator 3', 'High', '2025-05-15'],
];

export const initialCases: Case[] = caseSeed.map(([id, title, entityId, status, assignedTo, priority, date]) => ({
  id, title, entityId, status, assignedTo, priority,
  riskScore: entityById(entityId)?.riskScore ?? 50,
  updatedOn: date,
  description: `Investigation into ${title.toLowerCase()} involving ${entityById(entityId)?.name}. Triggered by correlated alerts and graph-based risk scoring.`,
  notes: id === 'CASE-1001'
    ? [{ id: 'n1', author: 'Investigator 1', at: '2025-05-18T10:40:00', text: 'Requested enhanced due diligence documents for the Singapore account.' }]
    : [],
  timeline: caseTimeline(id, date + 'T09:00:00', status),
}));

/* ---------- explainable AI ---------- */
export const explainEntity = (e: Entity) => {
  const factors = e.id === 'ENT-2457901' ? buildFactors(85, ENTITY_FACTORS, [30, 20, 20, 15]) : buildFactors(e.riskScore);
  const level = riskLevel(e.riskScore);
  const summary =
    level === 'High'
      ? 'This entity has frequent transactions with high-risk countries and is indirectly connected to sanctioned entities in the network.'
      : level === 'Medium'
        ? 'Activity shows elevated velocity and some exposure to higher-risk jurisdictions, but no direct links to sanctioned parties were found.'
        : 'Behaviour is consistent with the entity’s historical baseline. No sanctioned-entity links or unusual patterns were detected.';
  const top = [...factors].sort((a, b) => b.score - a.score);
  const findings = [
    `${top[0].name} is the largest contributor (${top[0].score} points).`,
    `${e.connections} direct connections analysed; ${Math.min(e.connected.length, 6)} neighbours inspected in the 2-hop subgraph.`,
    level === 'High' ? 'Two-hop path reaches an entity on the OFAC consolidated sanctions list.' : 'No path to a sanctioned entity within three hops.',
    `Model confidence: ${level === 'High' ? '94' : level === 'Medium' ? '88' : '91'}%.`,
  ];
  const actions =
    level === 'High' ? ['Open or escalate a case', 'Request enhanced due diligence', 'Consider freezing outbound payments pending review']
      : level === 'Medium' ? ['Add to watchlist', 'Review the last 30 days of activity'] : ['No action required', 'Continue routine monitoring'];
  return { model: 'Graph Neural Network (GNN)', factors, summary, findings, actions };
};

/* ---------- graph ---------- */
const gPos: [number, number][] = [[230, 160], [105, 65], [355, 65], [415, 165], [345, 268], [115, 268], [45, 165]];
export const graphNodes: GraphNode[] = fixedEntities.map((e, i) => ({
  id: e.id, label: `Entity_0${i + 1}`, x: gPos[i][0], y: gPos[i][1], score: e.riskScore,
}));
const gi = (i: number) => fixedEntities[i].id;
export const graphEdges: GraphEdge[] = [
  { from: gi(0), to: gi(1), label: 'TXN' }, { from: gi(0), to: gi(2), label: 'OWNS' },
  { from: gi(0), to: gi(3), label: 'TXN' }, { from: gi(0), to: gi(4), label: 'SHARED_ACCT' },
  { from: gi(0), to: gi(5), label: 'TXN' }, { from: gi(0), to: gi(6), label: 'DIRECTOR_OF' },
  { from: gi(1), to: gi(2), label: 'TXN' }, { from: gi(2), to: gi(3), label: 'LINKED' },
  { from: gi(4), to: gi(5), label: 'TXN' }, { from: gi(1), to: gi(6), label: 'TXN' },
];

export const egoGraph = (e: Entity): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const others = e.connected.map(entityById).filter((x): x is Entity => !!x).slice(0, 6);
  const nodes: GraphNode[] = [{ id: e.id, label: e.name.split(' ')[0].slice(0, 9), x: 230, y: 160, score: e.riskScore }];
  others.forEach((o, i) => {
    const a = (i / others.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({ id: o.id, label: o.name.split(' ')[0].slice(0, 9), x: 230 + Math.cos(a) * 165, y: 160 + Math.sin(a) * 105, score: o.riskScore });
  });
  return { nodes, edges: others.map((o, i) => ({ from: e.id, to: o.id, label: ['TXN', 'OWNS', 'LINKED', 'SHARED_ACCT'][i % 4] })) };
};

/* ---------- dashboard / report series ---------- */
export const riskDistribution = [
  { name: 'High Risk (70-100)', value: 18, color: '#DC2626' },
  { name: 'Medium Risk (40-70)', value: 34, color: '#F59E0B' },
  { name: 'Low Risk (0-40)', value: 48, color: '#16A34A' },
];
export const alertsTrend = [
  { day: 'May 11', label: 'Mon', alerts: 210 }, { day: 'May 12', label: 'Tue', alerts: 245 },
  { day: 'May 13', label: 'Wed', alerts: 232 }, { day: 'May 14', label: 'Thu', alerts: 288 },
  { day: 'May 15', label: 'Fri', alerts: 301 }, { day: 'May 16', label: 'Sat', alerts: 276 },
  { day: 'May 17', label: 'Sun', alerts: 354 },
];
export const volumeByMonth = [
  { month: 'Dec', volume: 9.1 }, { month: 'Jan', volume: 9.8 }, { month: 'Feb', volume: 10.2 },
  { month: 'Mar', volume: 11.0 }, { month: 'Apr', volume: 11.0 }, { month: 'May', volume: 12.8 },
];
export const detectionRate = [
  { month: 'Dec', rate: 88.2 }, { month: 'Jan', rate: 89.5 }, { month: 'Feb', rate: 90.1 },
  { month: 'Mar', rate: 91.7 }, { month: 'Apr', rate: 92.4 }, { month: 'May', rate: 94.1 },
];
export const highRiskCountries = [
  { country: 'Iran', alerts: 96 }, { country: 'Russia', alerts: 74 }, { country: 'Panama', alerts: 51 },
  { country: 'Nigeria', alerts: 43 }, { country: 'Cyprus', alerts: 29 },
];
