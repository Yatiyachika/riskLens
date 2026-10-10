import { useNavigate } from 'react-router-dom';
import { Button } from '../common/ui';
import { useApp } from '../../context/AppContext';
import type { Alert } from '../../types';

export default function AlertActions({ alert, onDone }: { alert: Alert; onDone?: () => void }) {
  const nav = useNavigate();
  const { investigateAlert, closeAlert } = useApp();
  const resolved = alert.status === 'Resolved';
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => { onDone?.(); nav(`/entities/${alert.entityId}`); }}>View Entity</Button>
      <Button variant="primary" onClick={() => { const id = investigateAlert(alert.id); onDone?.(); nav(`/cases/${id}`); }}>Investigate</Button>
      <Button disabled={resolved} onClick={() => closeAlert(alert.id)}>{resolved ? 'Alert closed' : 'Close Alert'}</Button>
    </div>
  );
}
