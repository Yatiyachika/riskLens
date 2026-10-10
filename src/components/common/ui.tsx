import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import type { AlertStatus, CaseStatus, Priority, ReviewStatus, RiskLevel } from '../../types';
import { riskLevel, riskTone } from '../../utils';

/* ---------- Button ---------- */
const variants = {
  primary: 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700',
  secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700',
  ghost: 'border-transparent text-slate-600 hover:bg-slate-100',
};
export function Button({
  variant = 'secondary', size = 'md', className = '', type = 'button', ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: 'sm' | 'md' }) {
  return (
    <button
      type={type}
      {...p}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'
      } ${variants[variant]} ${className}`}
    />
  );
}

/* ---------- Card ---------- */
export function Card({
  title, subtitle, action, children, className = '', bodyClass = 'p-4',
}: { title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/* ---------- Badges ---------- */
export function RiskBadge({ score }: { score: number }) {
  const t = riskTone[riskLevel(score)];
  return (
    <span className={`inline-flex min-w-[2.25rem] justify-center rounded border px-1.5 py-0.5 text-xs font-semibold tabular-nums ${t.bg} ${t.border} ${t.text}`}>
      {score}
    </span>
  );
}

export function LevelDot({ level }: { level: RiskLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
      <span className={`h-2 w-2 rounded-full ${riskTone[level].dot}`} />
      {level}
    </span>
  );
}

const pillTones = {
  blue: 'bg-brand-50 text-brand-700 border-brand-100',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};
export function Pill({ tone = 'slate', children }: { tone?: keyof typeof pillTones; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${pillTones[tone]}`}>{children}</span>;
}

const statusTone: Record<string, keyof typeof pillTones> = {
  Open: 'red', 'In Progress': 'blue', 'Under Review': 'amber', Closed: 'slate',
  Investigating: 'blue', Resolved: 'green',
  Pending: 'amber', Flagged: 'red', Cleared: 'green', Blocked: 'purple',
  Active: 'green', 'Under Watch': 'amber', Critical: 'red', High: 'red', Medium: 'amber', Low: 'green',
};
export function StatusPill({ status }: { status: CaseStatus | AlertStatus | ReviewStatus | Priority | string }) {
  return <Pill tone={statusTone[status] ?? 'slate'}>{status}</Pill>;
}

/* ---------- Form controls ---------- */
export const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Select({ className = '', ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className={`${inputCls} ${className}`} />;
}

export function SearchInput({ className = '', ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input {...p} type="search" className={`${inputCls} pl-9`} />
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({
  tabs, value, onChange,
}: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            value === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`rounded-full px-1.5 text-xs ${value === t.id ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Popover ---------- */
export function Popover({
  trigger, children, align = 'right', width = 'w-64',
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div className={`absolute z-40 mt-2 ${width} ${align === 'right' ? 'right-0' : 'left-0'} rounded-lg border border-slate-200 bg-white p-3 shadow-lg`}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/* ---------- Key/value rows ---------- */
export function KV({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
