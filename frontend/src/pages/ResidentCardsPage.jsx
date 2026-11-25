import React, { useState } from 'react';
import { UserCheck, Plus, Lock, Unlock, Trash2, X } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function ResidentCardsPage() {
  const { cards, upsertCard, toggleCardStatus, deleteCard } = useParking();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    uid: '',
    ownerName: '',
    apartment: '',
    licensePlate: '',
    phone: ''
  });

  const residentCards = Object.values(cards || {}).filter(
    (c) => (c.cardType || 'resident') === 'resident'
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.uid.trim()) return;
    await upsertCard({
      ...form,
      cardType: 'resident',
      status: 'active'
    });
    setForm({ uid: '', ownerName: '', apartment: '', licensePlate: '', phone: '' });
    setShowModal(false);
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <UserCheck size={20} color="#60a5fa" />
              <span>UC06 · Quản lý thẻ cư dân</span>
            </div>
            <div className="card-subtitle">
              Danh sách thẻ RFID cố định của cư dân (Bao gồm chức năng UC07: Đăng ký thẻ cư dân)
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Đăng ký thẻ cư dân (UC07)</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>UID Thẻ</th>
                <th>Chủ thẻ</th>
                <th>Căn hộ / Phòng</th>
                <th>Biển số xe</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {residentCards.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    Chưa có thẻ cư dân nào được đăng ký
                  </td>
                </tr>
              ) : (
                residentCards.map((card) => (
                  <tr key={card.uid}>
                    <td className="mono" style={{ fontWeight: 700 }}>{card.uid}</td>
                    <td>{card.ownerName}</td>
                    <td>{card.apartment || '---'}</td>
                    <td>{card.licensePlate || '---'}</td>
                    <td>{card.phone || '---'}</td>
                    <td>
                      <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {card.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        onClick={() => toggleCardStatus(card.uid)}
                        title={card.status === 'active' ? 'Khóa thẻ' : 'Mở khóa thẻ'}
                      >
                        {card.status === 'active' ? <Lock size={16} color="#f59e0b" /> : <Unlock size={16} color="#10b981" />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => {
                          if (window.confirm(`Xóa thẻ cư dân ${card.uid}?`)) deleteCard(card.uid);
                        }}
                        title="Xóa thẻ"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal UC07: Đăng ký thẻ cư dân */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>UC07 · Đăng ký thẻ cư dân mới</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegister} className="stack-lg" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Mã UID thẻ RFID *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: B491C20F"
                  value={form.uid}
                  onChange={(e) => setForm({ ...form, uid: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Họ tên cư dân *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Văn A"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  required
                />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Căn hộ</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: P1204 - Tòa A"
                    value={form.apartment}
                    onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Biển số xe</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: 29A-123.45"
                    value={form.licensePlate}
                    onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 0912345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu & Kích hoạt thẻ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
