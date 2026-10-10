import { useState } from 'react';
import OverviewSection from '../components/dashboard/OverviewSection';
import LiveTransactions from '../components/dashboard/LiveTransactions';
import GraphSection from '../components/dashboard/GraphSection';
import HighRiskAlert from '../components/dashboard/HighRiskAlert';
import RiskExplanation from '../components/dashboard/RiskExplanation';
import CaseManagement from '../components/dashboard/CaseManagement';
import PageHeader from '../components/common/PageHeader';

export default function Dashboard() {
  // The graph selection drives the entity details and the explainable-AI panel.
  const [entityId, setEntityId] = useState('ENT-2457901');
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Fraud and AML monitoring · 18 May 2025" />
      <div className="grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
        <OverviewSection />
        <LiveTransactions />
        <GraphSection selectedId={entityId} onSelect={setEntityId} />
        <HighRiskAlert />
        <RiskExplanation entityId={entityId} />
        <CaseManagement />
      </div>
    </>
  );
}
