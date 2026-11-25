import React from 'react';
import { Car, CheckCircle2, AlertCircle, Activity, ArrowDownUp } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function OverviewPage() {
  const { parkingStatus, logs } = useParking();
  const { slots = [], availableSlots = 0, totalSlots = 4 } = parkingStatus;
  const occupiedSlots = totalSlots - availableSlots;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  return (
    <div className="stack-lg">
      {/* UC02 & UC04: Thống kê tổng quan & số lượng chỗ trống */}
      <div className="grid-4">
        <div className="stat-card">
          <div>
            <div className="stat-label">Chỗ trống hiện tại</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {availableSlots} <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>/ {totalSlots}</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Vị trí đã có xe</div>
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{occupiedSlots}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}>
            <Car size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Tỷ lệ lấp đầy</div>
            <div className="stat-value">{occupancyRate}%</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Tổng lượt vào / ra</div>
            <div className="stat-value">{logs.length}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-soft)', color: '#818cf8' }}>
            <ArrowDownUp size={24} />
          </div>
        </div>
      </div>

      {/* UC03: Theo dõi trạng thái vị trí đỗ */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Sơ đồ trạng thái 4 vị trí đỗ xe (Real-time)</div>
            <div className="card-subtitle">Dữ liệu cập nhật từ 4 cảm biến siêu âm HC-SR04 qua ESP32</div>
          </div>
          <span className={`badge ${availableSlots > 0 ? 'badge-success' : 'badge-danger'}`}>
            {availableSlots > 0 ? `Còn ${availableSlots} chỗ trống` : 'BÃI XE ĐÃ ĐẦY'}
          </span>
        </div>

        <div className="grid-4">
          {slots.map((slot) => {
            const occupied = slot.isOccupied;
            return (
              <div key={slot.id} className={`slot-card ${occupied ? 'slot-occupied' : 'slot-free'}`}>
                <div className="slot-header">
                  <span>VỊ TRÍ #{slot.id}</span>
                  {occupied ? (
                    <span className="badge badge-danger">
                      <AlertCircle size={12} /> Có xe
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Trống
                    </span>
                  )}
                </div>

                <Car
                  size={52}
                  color={occupied ? '#ef4444' : '#475569'}
                  style={{ opacity: occupied ? 1 : 0.35 }}
                />

                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Khoảng cách đo: <span className="mono" style={{ color: 'var(--text-primary)' }}>{slot.distance ?? '--'} cm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sự kiện gần nhất */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Hoạt động vào / ra gần nhất</div>
            <div className="card-subtitle">5 lượt quẹt thẻ RFID mới nhất tại cổng</div>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Cổng</th>
                <th>UID Thẻ</th>
                <th>Biển số</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id}>
                  <td className="mono">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</td>
                  <td>{log.gate === 'entry' ? 'Cổng vào' : 'Cổng ra'}</td>
                  <td className="mono">{log.uid}</td>
                  <td>{log.licensePlate || '---'}</td>
                  <td>
                    <span className={`badge ${log.action === 'IN' ? 'badge-success' : 'badge-info'}`}>
                      {log.action === 'IN' ? 'Xe vào' : 'Xe ra'}
                    </span>
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
