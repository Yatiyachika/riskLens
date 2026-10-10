import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Empty } from '../common/ui';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'right';
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  emptyTitle?: string;
  compact?: boolean;
}

export default function DataTable<T>({
  columns, rows, rowKey, onRowClick, pageSize, defaultSort, emptyTitle = 'No results', compact,
}: Props<T>) {
  const [sort, setSort] = useState(defaultSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const f = col.sortValue;
    return [...rows].sort((a, b) => {
      const x = f(a), y = f(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
      return sort.dir === 'asc' ? r : -r;
    });
  }, [rows, sort, columns]);

  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  useEffect(() => { setPage(1); }, [rows.length]);
  const view = pageSize ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));

  const pad = compact ? 'px-3 py-2' : 'px-4 py-3';
  const windowStart = Math.max(1, Math.min(page - 2, pages - 4));
  const pageNums = Array.from({ length: Math.min(5, pages) }, (_, i) => windowStart + i);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`${pad} whitespace-nowrap ${c.align === 'right' ? 'text-right' : ''}`}
                  aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortValue ? (
                    <button onClick={() => toggle(c.key)} className="inline-flex items-center gap-1 hover:text-slate-800">
                      {c.header}
                      {sort?.key === c.key ? (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(r) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                className={`border-b border-slate-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-brand-50/50 focus-visible:bg-brand-50/50' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`${pad} whitespace-nowrap text-slate-700 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className ?? ''}`}>{c.render(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!view.length && <Empty title={emptyTitle} hint="Try adjusting your search or filters." />}
      {pageSize && sorted.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
            {pageNums.map((n) => (
              <button key={n} onClick={() => setPage(n)} aria-current={n === page ? 'page' : undefined}
                className={`h-7 min-w-[1.75rem] rounded border px-2 ${n === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 hover:bg-slate-50'}`}>{n}</button>
            ))}
            <button aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
