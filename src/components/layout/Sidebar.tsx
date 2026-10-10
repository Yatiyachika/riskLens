import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, BarChart3, Briefcase, LayoutDashboard, Network, Settings, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/mockData';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: ShieldAlert, badge: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/cases', label: 'Cases', icon: Briefcase },
  { to: '/entities', label: 'Entities', icon: Network },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, mobileOpen, onClose }: { collapsed: boolean; mobileOpen: boolean; onClose: () => void }) {
  const { alerts } = useApp();
  const open = alerts.filter((a) => a.status === 'Open').length;
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-navy-900/50 lg:hidden" onClick={onClose} />}
      <aside
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-slate-300 transition-transform lg:static lg:translate-x-0 lg:transition-[width] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[72px]' : 'lg:w-60'}`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <ShieldCheck className="h-6 w-6 shrink-0 text-brand-500" />
          {(!collapsed || mobileOpen) && <span className={`text-[17px] font-semibold tracking-tight text-white ${collapsed ? 'lg:hidden' : ''}`}>RiskLens</span>}
          <button onClick={onClose} aria-label="Close menu" className="ml-auto rounded p-1 text-slate-400 hover:text-white lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to} to={to} onClick={onClose} title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-navy-700 text-white' : 'hover:bg-navy-800 hover:text-white'
                } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
              {badge && open > 0 && (
                <span className={`ml-auto rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white ${collapsed ? 'lg:hidden' : ''}`}>{open}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className={`flex items-center gap-3 border-t border-white/10 p-4 ${collapsed ? 'lg:justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">PS</div>
          <div className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-medium text-white">{CURRENT_USER.name}</p>
            <p className="truncate text-xs text-slate-400">{CURRENT_USER.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
