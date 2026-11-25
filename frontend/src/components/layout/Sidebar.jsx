import React from 'react';
import {
  Car, LayoutDashboard, History, CreditCard, UserCheck,
  ScanLine, Cpu, BarChart3, Users, Shield, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasAccess, ROLE_LABELS } from '../../utils/permissions';

const MENU_ITEMS = [
  { key: 'overview', label: 'Tổng quan & Chỗ trống', icon: LayoutDashboard, section: 'Giám sát bãi xe' },
  { key: 'history', label: 'Lịch sử xe vào/ra', icon: History, section: 'Giám sát bãi xe' },
  { key: 'resident-cards', label: 'Quản lý thẻ cư dân', icon: UserCheck, section: 'Quản lý thẻ RFID' },
  { key: 'guest-cards', label: 'Thẻ khách vãng lai', icon: CreditCard, section: 'Quản lý thẻ RFID' },
  { key: 'gate-ops', label: 'Vận hành & Xác thực cổng', icon: ScanLine, section: 'Nghiệp vụ nhân viên' },
  { key: 'devices', label: 'Trạng thái thiết bị', icon: Cpu, section: 'Nghiệp vụ nhân viên' },
  { key: 'reports', label: 'Báo cáo hoạt động', icon: BarChart3, section: 'Thống kê' },
  { key: 'accounts', label: 'Quản lý tài khoản', icon: Users, section: 'Quản trị hệ thống' },
  { key: 'permissions', label: 'Phân quyền người dùng', icon: Shield, section: 'Quản trị hệ thống' }
];

export default function Sidebar({ activePage, onSelectPage, mobileOpen, onCloseMobile }) {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role;

  const visibleItems = MENU_ITEMS.filter((item) => hasAccess(role, item.key));
  const sections = [...new Set(visibleItems.map((i) => i.section))];

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Car size={22} />
        </div>
        <div>
          <div className="brand-title">SMART PARKING</div>
          <div className="brand-subtitle">IoT 4-Layer System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {visibleItems
              .filter((item) => item.section === section)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    className={`nav-item ${activePage === item.key ? 'active' : ''}`}
                    onClick={() => {
                      onSelectPage(item.key);
                      onCloseMobile();
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-mini-card">
          <div className="user-avatar">
            {(currentUser?.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <div className="user-name">{currentUser?.fullName}</div>
            <div className="user-role">{ROLE_LABELS[role] || role}</div>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            title="Đăng xuất"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
