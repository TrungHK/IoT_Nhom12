import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import HistoryPage from './pages/HistoryPage';
import ResidentCardsPage from './pages/ResidentCardsPage';
import GuestCardsPage from './pages/GuestCardsPage';
import GateOperationsPage from './pages/GateOperationsPage';
import DevicesPage from './pages/DevicesPage';
import ReportsPage from './pages/ReportsPage';
import AccountsPage from './pages/AccountsPage';
import PermissionsPage from './pages/PermissionsPage';
import { getDefaultPageForRole, hasAccess } from './utils/permissions';

const PAGE_TITLES = {
  overview: 'Tổng quan bãi đỗ xe',
  history: 'Lịch sử xe vào / ra',
  'resident-cards': 'Quản lý thẻ cư dân',
  'guest-cards': 'Quản lý thẻ khách vãng lai',
  'gate-ops': 'Vận hành & Xác thực cổng RFID',
  devices: 'Theo dõi trạng thái thiết bị',
  reports: 'Báo cáo hoạt động bãi xe',
  accounts: 'Quản lý tài khoản',
  permissions: 'Phân quyền người dùng'
};

function AppContent() {
  const { currentUser } = useAuth();
  const [activePage, setActivePage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (!hasAccess(currentUser.role, activePage)) {
        setActivePage(getDefaultPageForRole(currentUser.role));
      }
    }
  }, [currentUser, activePage]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'history':
        return <HistoryPage />;
      case 'resident-cards':
        return <ResidentCardsPage />;
      case 'guest-cards':
        return <GuestCardsPage />;
      case 'gate-ops':
        return <GateOperationsPage />;
      case 'devices':
        return <DevicesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'permissions':
        return <PermissionsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main-wrapper">
        <Topbar
          title={PAGE_TITLES[activePage] || 'Smart Parking'}
          onOpenMobile={() => setMobileOpen((prev) => !prev)}
        />
        <main className="main-content">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <AppContent />
      </ParkingProvider>
    </AuthProvider>
  );
}
