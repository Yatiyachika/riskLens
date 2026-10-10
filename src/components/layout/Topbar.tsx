import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SearchInput, Popover, RiskBadge } from '../common/ui';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';
import { fmtTime } from '../../utils';

export default function Topbar({ collapsed, onToggle, onMenu }: { collapsed: boolean; onToggle: () => void; onMenu: () => void }) {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { alerts, notify } = useApp();
  const recent = alerts.filter((a) => a.status === 'Open').slice(0, 4);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenu} aria-label="Open menu" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
      <button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:block">
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
      <form
        className="max-w-md flex-1"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) { nav(`/entities?q=${encodeURIComponent(q.trim())}`); setQ(''); } }}
      >
        <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entity, account or transaction ID" aria-label="Global search" />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <Popover width="w-80" trigger={(_, t) => (
          <button onClick={t} aria-label="Notifications" className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            {recent.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
          </button>
        )}>
          {(close) => (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Open alerts</p>
              <ul className="space-y-1">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link to="/alerts" onClick={close} className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-50">
                      <RiskBadge score={a.riskScore} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-800">{a.reason}</span>
                        <span className="text-[11px] text-slate-500">{a.entityId} · {fmtTime(a.detectedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                {!recent.length && <li className="p-2 text-xs text-slate-500">You’re all caught up.</li>}
              </ul>
              <Link to="/alerts" onClick={close} className="mt-2 block rounded-md bg-slate-50 py-1.5 text-center text-xs font-medium text-brand-700 hover:bg-brand-50">View all alerts</Link>
            </div>
          )}
        </Popover>
        <Popover width="w-56" trigger={(_, t) => (
          <button onClick={t} className="flex items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 hover:bg-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">PS</span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-slate-800">{CURRENT_USER.name}</span>
              <span className="block text-[11px] text-slate-500">{CURRENT_USER.role}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>
        )}>
          {(close) => (
            <div className="-m-1 text-sm">
              <p className="px-2 py-1 text-xs text-slate-500">{CURRENT_USER.email}</p>
              <Link to="/settings" onClick={close} className="block rounded-md px-2 py-2 hover:bg-slate-50">Profile & settings</Link>
              <button onClick={() => { close(); notify('Signed out (demo only)', 'info'); }} className="block w-full rounded-md px-2 py-2 text-left hover:bg-slate-50">Sign out</button>
            </div>
          )}
        </Popover>
      </div>
    </header>
  );
}
