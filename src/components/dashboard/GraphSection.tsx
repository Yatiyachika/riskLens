import { useNavigate } from 'react-router-dom';
import { Button, Card, KV } from '../common/ui';
import NetworkGraph from '../charts/NetworkGraph';
import { entityById, graphEdges, graphNodes } from '../../data/mockData';

export default function GraphSection({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const nav = useNavigate();
  const e = entityById(selectedId)!;
  return (
    <Card title="Graph Visualization (Neo4j)" subtitle="Select a node to inspect the entity">
      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-2">
          <NetworkGraph nodes={graphNodes} edges={graphEdges} selectedId={selectedId} onSelect={onSelect} />
          <div className="flex justify-center gap-4 pb-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-600" />High</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" />Medium</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-600" />Low</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Entity Details</h3>
          <dl>
            <KV label="Entity ID">{e.id}</KV>
            <KV label="Type">{e.type}</KV>
            <KV label="Country">{e.country}</KV>
            <KV label="Risk Score">{e.riskScore}</KV>
            <KV label="Connections">{e.connections}</KV>
          </dl>
          <Button className="mt-3 w-full" onClick={() => nav(`/entities/${e.id}`)}>View Full Profile</Button>
        </div>
      </div>
    </Card>
  );
}
