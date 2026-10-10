import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ToastHost } from '../common/Overlays';
import TransactionDrawer from '../tables/TransactionDrawer';
import ExplanationModal from '../entities/ExplanationModal';
import NewCaseModal from '../cases/NewCaseModal';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setMobile(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar collapsed={collapsed} mobileOpen={mobile} onClose={() => setMobile(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onMenu={() => setMobile(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6"><Outlet /></div>
        </main>
      </div>
      <TransactionDrawer />
      <ExplanationModal />
      <NewCaseModal />
      <ToastHost />
    </div>
  );
}
