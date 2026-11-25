import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ROLES, ROLE_LABELS } from '../utils/permissions';

const USE_CASE_MATRIX = [
  { code: 'UC01', name: 'Đăng nhập hệ thống', manager: true, staff: true, admin: true },
  { code: 'UC02 - UC04', name: 'Xem tổng quan, vị trí đỗ & số chỗ trống', manager: true, staff: true, admin: false },
  { code: 'UC05', name: 'Xem lịch sử xe vào/ra', manager: true, staff: true, admin: false },
  { code: 'UC06 - UC07', name: 'Quản lý & Đăng ký thẻ cư dân', manager: true, staff: false, admin: false },
  { code: 'UC08', name: 'Quản lý thẻ khách vãng lai', manager: true, staff: false, admin: false },
  { code: 'UC09', name: 'Cấp thẻ RFID tạm thời', manager: true, staff: true, admin: false },
  { code: 'UC10 - UC11', name: 'Xác thực thẻ RFID & Ghi nhận xe vào/ra', manager: false, staff: true, admin: false },
  { code: 'UC12', name: 'Theo dõi trạng thái thiết bị', manager: false, staff: true, admin: false },
  { code: 'UC13', name: 'Xem báo cáo hoạt động bãi xe', manager: true, staff: false, admin: false },
  { code: 'UC14 - UC15', name: 'Quản lý tài khoản & Phân quyền người dùng', manager: false, staff: false, admin: true }
];

export default function PermissionsPage() {
  const { users, upsertUser } = useParking();
  const userList = Object.values(users || {});

  const handleRoleChange = async (user, newRole) => {
    await upsertUser({ ...user, role: newRole });
  };

  return (
    <div className="stack-lg">
      {/* Phân quyền trực tiếp trên từng tài khoản */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Shield size={20} color="#60a5fa" />
              <span>UC15 · Phân quyền người dùng</span>
            </div>
            <div className="card-subtitle">
              Gán hoặc thay đổi vai trò cho từng tài khoản trong hệ thống
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Vai trò hiện tại</th>
                <th>Thay đổi vai trò</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.uid}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td className="mono">{u.email}</td>
                  <td>
                    <span className="badge badge-info">{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td style={{ width: 240 }}>
                    <select
                      className="form-control"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                    >
                      <option value={ROLES.MANAGER}>Quản lý bãi đỗ xe</option>
                      <option value={ROLES.STAFF}>Nhân viên bãi đỗ</option>
                      <option value={ROLES.ADMIN}>Quản trị viên hệ thống</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ma trận phân quyền theo Use Case */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Ma trận phân quyền theo Use Case</div>
            <div className="card-subtitle">Ánh xạ đúng theo sơ đồ Use Case hệ thống bãi đỗ xe thông minh</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã UC</th>
                <th>Chức năng</th>
                <th style={{ textAlign: 'center' }}>Quản lý bãi xe</th>
                <th style={{ textAlign: 'center' }}>Nhân viên bãi đỗ</th>
                <th style={{ textAlign: 'center' }}>Quản trị viên</th>
              </tr>
            </thead>
            <tbody>
              {USE_CASE_MATRIX.map((row) => (
                <tr key={row.code}>
                  <td className="mono" style={{ fontWeight: 700 }}>{row.code}</td>
                  <td>{row.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row.manager ? <Check size={16} color="#10b981" /> : <X size={16} color="#475569" />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.staff ? <Check size={16} color="#10b981" /> : <X size={16} color="#475569" />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.admin ? <Check size={16} color="#10b981" /> : <X size={16} color="#475569" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
