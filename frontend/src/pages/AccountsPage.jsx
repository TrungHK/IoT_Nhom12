import React, { useState } from 'react';
import { Users, Plus, Lock, Unlock, Trash2, X } from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ROLES, ROLE_LABELS } from '../utils/permissions';

export default function AccountsPage() {
  const { users, upsertUser, deleteUser } = useParking();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: ROLES.STAFF
  });

  const userList = Object.values(users || {});

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;
    await upsertUser({
      ...form,
      status: 'active'
    });
    setForm({ fullName: '', email: '', role: ROLES.STAFF });
    setShowModal(false);
  };

  const toggleLock = async (user) => {
    await upsertUser({
      ...user,
      status: user.status === 'active' ? 'locked' : 'active'
    });
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Users size={20} color="#60a5fa" />
              <span>UC14 · Quản lý tài khoản hệ thống</span>
            </div>
            <div className="card-subtitle">
              Tạo mới, khóa/mở khóa và xóa tài khoản người vận hành phần mềm
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Thêm tài khoản mới</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email đăng nhập</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.uid}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td className="mono">{u.email}</td>
                  <td>
                    <span className="badge badge-primary">{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-icon"
                      onClick={() => toggleLock(u)}
                      title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.status === 'active' ? <Lock size={16} color="#f59e0b" /> : <Unlock size={16} color="#10b981" />}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        if (window.confirm(`Xóa tài khoản ${u.email}?`)) deleteUser(u.uid);
                      }}
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Thêm tài khoản mới</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="stack-lg" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vai trò</label>
                <select
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value={ROLES.MANAGER}>Quản lý bãi đỗ xe</option>
                  <option value={ROLES.STAFF}>Nhân viên bãi đỗ</option>
                  <option value={ROLES.ADMIN}>Quản trị viên hệ thống</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo tài khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
