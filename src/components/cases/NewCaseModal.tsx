import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Overlays';
import { Button, Field, Select, inputCls } from '../common/ui';
import { useApp } from '../../context/AppContext';
import { INVESTIGATORS, entities } from '../../data/mockData';
import type { Priority } from '../../types';

const empty = { title: '', entityId: entities[0].id, priority: 'Medium' as Priority, description: '', assignedTo: INVESTIGATORS[0] };

export default function NewCaseModal() {
  const { newCase, closeNewCase, addCase } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState(empty);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (newCase.open) { setF({ ...empty, entityId: newCase.entityId ?? empty.entityId }); setErr(''); }
  }, [newCase.open, newCase.entityId]);

  const submit = () => {
    if (!f.title.trim()) return setErr('Enter a case title to continue.');
    const c = addCase({ ...f, title: f.title.trim() });
    closeNewCase();
    nav(`/cases/${c.id}`);
  };

  return (
    <Modal
      open={newCase.open} onClose={closeNewCase} title="New case"
      footer={<><Button onClick={closeNewCase}>Cancel</Button><Button variant="primary" onClick={submit}>Create case</Button></>}
    >
      <div className="space-y-4">
        <Field label="Case title">
          <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Suspicious layering through shell accounts" autoFocus />
          {err && <span className="mt-1 block text-xs text-red-600">{err}</span>}
        </Field>
        <Field label="Entity">
          <Select value={f.entityId} onChange={(e) => setF({ ...f, entityId: e.target.value })}>
            {entities.map((e) => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <Select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value as Priority })}>
              {['Critical', 'High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Assign investigator">
            <Select value={f.assignedTo} onChange={(e) => setF({ ...f, assignedTo: e.target.value })}>
              {INVESTIGATORS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Description">
          <textarea className={inputCls} rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What triggered this case and what should be reviewed first?" />
        </Field>
      </div>
    </Modal>
  );
}
