import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar, getPageTitle } from './Topbar';
import { Modal } from '@/components/ui/Modal';
import { ToastContainer } from '@/components/ui/Toast';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="page active" id="appPage">
      <Sidebar />
      <main id="mainContent">
        <Topbar title={getPageTitle(location.pathname)} />
        <Outlet />
      </main>
      <Modal />
      <ToastContainer />
    </div>
  );
}
