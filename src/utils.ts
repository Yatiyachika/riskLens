import type { RiskLevel } from './types';

export const riskLevel = (s: number): RiskLevel => (s >= 70 ? 'High' : s >= 40 ? 'Medium' : 'Low');

export const riskTone = {
  High: { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', hex: '#DC2626' },
  Medium: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', hex: '#F59E0B' },
  Low: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', hex: '#16A34A' },
} as const;

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const pad = (n: number) => String(n).padStart(2, '0');
export const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtDateTime = (iso: string) => `${fmtDate(iso)}, ${fmtTime(iso)}`;
export const dayKey = (iso: string) => iso.slice(0, 10);

export function downloadFile(name: string, content: string, mime = 'text/csv') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const toCsv = (rows: Record<string, string | number>[]) => {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
};
