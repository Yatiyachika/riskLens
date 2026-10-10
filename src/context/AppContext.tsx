import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Alert, Case, Priority, Transaction } from '../types';
import { CURRENT_USER, NOW, entityById, initialAlerts, initialCases } from '../data/mockData';

export type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }
export interface NewCaseInput { title: string; entityId: string; priority: Priority; description: string; assignedTo: string }

interface Ctx {
  alerts: Alert[];
  cases: Case[];
  toasts: Toast[];
  notify: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
  closeAlert: (id: string) => void;
  investigateAlert: (id: string) => string;
  addCase: (input: NewCaseInput) => Case;
  addNote: (caseId: string, text: string) => void;
  updateCase: (caseId: string, patch: Partial<Pick<Case, 'status' | 'assignedTo' | 'priority'>>) => void;
  txn: Transaction | null;
  openTxn: (t: Transaction | null) => void;
  explainId: string | null;
  openExplanation: (id: string | null) => void;
  newCase: { open: boolean; entityId?: string };
  openNewCase: (entityId?: string) => void;
  closeNewCase: () => void;
}

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

const today = () => NOW;

export function AppProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [txn, openTxn] = useState<Transaction | null>(null);
  const [explainId, openExplanation] = useState<string | null>(null);
  const [newCase, setNewCase] = useState<{ open: boolean; entityId?: string }>({ open: false });

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3800);
  }, [dismissToast]);

  const closeAlert = useCallback((id: string) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: 'Resolved' } : x)));
    notify('Alert closed successfully');
  }, [notify]);

  const buildCase = (input: NewCaseInput, count: number): Case => {
    const id = `CASE-${1001 + count}`;
    return {
      id, ...input,
      status: 'Open',
      riskScore: entityById(input.entityId)?.riskScore ?? 50,
      updatedOn: today(),
      notes: [],
      timeline: [
        { id: id + 't1', at: today(), title: 'Case created', detail: `Opened by ${CURRENT_USER.name}.` },
        { id: id + 't2', at: today(), title: 'Assigned', detail: `Assigned to ${input.assignedTo}.` },
      ],
    };
  };

  const addCase = useCallback((input: NewCaseInput) => {
    const c = buildCase(input, cases.length);
    setCases((cs) => [c, ...cs]);
    notify(`${c.id} created`);
    return c;
  }, [cases.length, notify]);

  const investigateAlert = useCallback((id: string) => {
    const a = alerts.find((x) => x.id === id)!;
    let c = cases.find((x) => x.entityId === a.entityId && x.status !== 'Closed');
    if (!c) {
      c = buildCase({
        title: a.reason, entityId: a.entityId,
        priority: a.riskScore >= 90 ? 'Critical' : a.riskScore >= 70 ? 'High' : 'Medium',
        description: `Investigation opened from alert ${a.id}: ${a.reason}. Matched with ${a.matchedWith}.`,
        assignedTo: 'Investigator 1',
      }, cases.length);
      const created = c;
      setCases((cs) => [created, ...cs]);
      notify(`${c.id} opened for investigation`);
    } else {
      notify(`Opened existing case ${c.id}`, 'info');
    }
    setAlerts((as) => as.map((x) => (x.id === id && x.status === 'Open' ? { ...x, status: 'Investigating' } : x)));
    return c.id;
  }, [alerts, cases, notify]);

  const addNote = useCallback((caseId: string, text: string) => {
    setCases((cs) => cs.map((c) => c.id !== caseId ? c : {
      ...c, updatedOn: today(),
      notes: [{ id: 'n' + Date.now(), author: CURRENT_USER.name, at: today(), text }, ...c.notes],
      timeline: [{ id: 't' + Date.now(), at: today(), title: 'Note added', detail: text.slice(0, 80) }, ...c.timeline],
    }));
    notify('Investigation note added');
  }, [notify]);

  const updateCase = useCallback((caseId: string, patch: Partial<Pick<Case, 'status' | 'assignedTo' | 'priority'>>) => {
    setCases((cs) => cs.map((c) => {
      if (c.id !== caseId) return c;
      const [k, v] = Object.entries(patch)[0];
      return {
        ...c, ...patch, updatedOn: today(),
        timeline: [{ id: 't' + Date.now(), at: today(), title: `${k === 'assignedTo' ? 'Assignee' : k[0].toUpperCase() + k.slice(1)} changed`, detail: `Set to ${v}.` }, ...c.timeline],
      };
    }));
    notify('Case updated');
  }, [notify]);

  const value = useMemo<Ctx>(() => ({
    alerts, cases, toasts, notify, dismissToast, closeAlert, investigateAlert, addCase, addNote, updateCase,
    txn, openTxn, explainId, openExplanation, newCase,
    openNewCase: (entityId?: string) => setNewCase({ open: true, entityId }),
    closeNewCase: () => setNewCase({ open: false }),
  }), [alerts, cases, toasts, notify, dismissToast, closeAlert, investigateAlert, addCase, addNote, updateCase, txn, explainId, newCase]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
