import React, { useState } from 'react';
import { Car, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';

export default function LoginPage() {
  const { login, quickLoginByRole, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="brand-icon" style={{ width: 46, height: 46 }}>
            <Car size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Smart Parking System</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              UC01 · Đăng nhập hệ thống quản lý bãi đỗ xe
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="stack-lg" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="vd: manager@smartparking.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu (Demo: 123456)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px 16px' }} disabled={authLoading}>
            <Lock size={16} />
            <span>{authLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
          </button>
        </form>

        <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 6 }}>
            Đăng nhập nhanh theo vai trò (Use Case Actors)
          </div>
          <div className="role-demo-grid">
            <button
              type="button"
              className="role-demo-btn"
              onClick={() => quickLoginByRole(ROLES.MANAGER)}
            >
              Quản lý bãi xe
            </button>
            <button
              type="button"
              className="role-demo-btn"
              onClick={() => quickLoginByRole(ROLES.STAFF)}
            >
              Nhân viên bãi
            </button>
            <button
              type="button"
              className="role-demo-btn"
              onClick={() => quickLoginByRole(ROLES.ADMIN)}
            >
              Quản trị viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
