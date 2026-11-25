import React, { useState } from 'react';
import { CreditCard, Plus, Lock, Unlock, Trash2, X } from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';

export default function GuestCardsPage() {
  const { cards, upsertCard, toggleCardStatus, deleteCard } = useParking();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === ROLES.MANAGER;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    uid: '',
    licensePlate: '',
    phone: ''
  });

  const guestCards = Object.values(cards || {}).filter(
    (c) => c.cardType === 'guest'
  );

  // UC09: Cấp thẻ RFID tạm thời
  const handleIssueGuestCard = async (e) => {
    e.preventDefault();
    if (!form.uid.trim()) return;
    await upsertCard({
      uid: form.uid,
      cardType: 'guest',
      ownerName: `Khách vãng lai (${form.licensePlate || 'Tạm thời'})`,
      licensePlate: form.licensePlate,
      phone: form.phone,
      issuedBy: currentUser?.fullName || 'Nhân viên',
      status: 'active'
    });
    setForm({ uid: '', licensePlate: '', phone: '' });
    setShowModal(false);
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <CreditCard size={20} color="#f59e0b" />
              <span>{isManager ? 'UC08 · Quản lý thẻ khách vãng lai' : 'UC09 · Cấp thẻ RFID tạm thời'}</span>
            </div>
            <div className="card-subtitle">
              Quản lý và cấp phát thẻ RFID tạm thời cho khách gửi xe theo lượt
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Cấp thẻ tạm thời (UC09)</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>UID Thẻ</th>
                <th>Biển số xe</th>
                <th>SĐT liên hệ</th>
                <th>Người cấp</th>
                <th>Thời gian cấp</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {guestCards.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 28, color: 'var(--text-muted)' }}>
                    Hiện không có thẻ khách vãng lai nào đang lưu hành
                  </td>
                </tr>
              ) : (
                guestCards.map((card) => (
                  <tr key={card.uid}>
                    <td className="mono" style={{ fontWeight: 700 }}>{card.uid}</td>
                    <td>{card.licensePlate || '---'}</td>
                    <td>{card.phone || '---'}</td>
                    <td>{card.issuedBy || 'Hệ thống'}</td>
                    <td className="mono">{new Date(card.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${card.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {card.status === 'active' ? 'Đang sử dụng' : 'Đã thu hồi/khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isManager && (
                        <>
                          <button
                            className="btn-icon"
                            onClick={() => toggleCardStatus(card.uid)}
                            title={card.status === 'active' ? 'Khóa thẻ' : 'Mở thẻ'}
                          >
                            {card.status === 'active' ? <Lock size={16} color="#f59e0b" /> : <Unlock size={16} color="#10b981" />}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => {
                              if (window.confirm(`Thu hồi và xóa thẻ tạm ${card.uid}?`)) deleteCard(card.uid);
                            }}
                            title="Thu hồi thẻ"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </>
                      )}
                      {!isManager && (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={() => toggleCardStatus(card.uid)}
                        >
                          {card.status === 'active' ? 'Thu hồi' : 'Kích hoạt'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal UC09 */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>UC09 · Cấp thẻ RFID tạm thời</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueGuestCard} className="stack-lg" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Mã UID thẻ tạm *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: GUEST002"
                  value={form.uid}
                  onChange={(e) => setForm({ ...form, uid: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Biển số xe khách *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 30F-999.11"
                  value={form.licensePlate}
                  onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại (tùy chọn)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: 0909123456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Cấp thẻ ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
