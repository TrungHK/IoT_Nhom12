import React from 'react';
import { BarChart3, Download, Users, Car } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function ReportsPage() {
  const { logs, cards, parkingStatus } = useParking();

  const totalIn = logs.filter((l) => l.action === 'IN' || l.gate === 'entry').length;
  const totalOut = logs.filter((l) => l.action === 'OUT' || l.gate === 'exit').length;
  const cardValues = Object.values(cards || {});
  const residentCount = cardValues.filter((c) => (c.cardType || 'resident') === 'resident').length;
  const guestCount = cardValues.filter((c) => c.cardType === 'guest').length;

  const exportCsv = () => {
    const header = 'Thoi gian,Cong,UID,Loai the,Bien so,Hanh dong\n';
    const rows = logs
      .map((l) => [
        new Date(l.timestamp).toLocaleString('vi-VN'),
        l.gate,
        l.uid,
        l.cardType || 'resident',
        l.licensePlate || '',
        l.action
      ].join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-bai-xe-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <BarChart3 size={20} color="#60a5fa" />
              <span>UC13 · Báo cáo hoạt động bãi đỗ xe</span>
            </div>
            <div className="card-subtitle">Tổng hợp lưu lượng xe vào/ra, tỷ lệ thẻ cư dân & khách vãng lai</div>
          </div>
          <button className="btn btn-primary" onClick={exportCsv}>
            <Download size={16} />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 22 }}>
          <div className="stat-card">
            <div>
              <div className="stat-label">Tổng lượt xe vào</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{totalIn}</div>
            </div>
            <Car size={24} color="#10b981" />
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Tổng lượt xe ra</div>
              <div className="stat-value" style={{ color: '#818cf8' }}>{totalOut}</div>
            </div>
            <Car size={24} color="#818cf8" />
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Thẻ cư dân</div>
              <div className="stat-value">{residentCount}</div>
            </div>
            <Users size={24} color="#60a5fa" />
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Thẻ khách vãng lai</div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{guestCount}</div>
            </div>
            <Users size={24} color="#f59e0b" />
          </div>
        </div>

        {/* Biểu đồ thanh trực quan bằng Pure CSS */}
        <div style={{
          padding: 20,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            Tỷ lệ sử dụng chỗ đỗ hiện tại ({parkingStatus.totalSlots - parkingStatus.availableSlots}/{parkingStatus.totalSlots} ô)
          </div>
          <div style={{ width: '100%', height: 18, backgroundColor: 'var(--bg-surface)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${((parkingStatus.totalSlots - parkingStatus.availableSlots) / Math.max(1, parkingStatus.totalSlots)) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--info))',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
