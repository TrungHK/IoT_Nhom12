import React from 'react';
import { Cpu, Wifi, Radio, Monitor, Activity } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function DevicesPage() {
  const { devices, parkingStatus } = useParking();
  const { slots = [], availableSlots = 0, totalSlots = 4 } = parkingStatus;

  return (
    <div className="stack-lg">
      {/* UC12: Theo dõi trạng thái thiết bị lớp phần cứng */}
      <div className="grid-3">
        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title"><Cpu size={18} color="#60a5fa" /> ESP32 Controller</div>
            <span className={`badge ${devices.esp32Online ? 'badge-success' : 'badge-danger'}`}>
              {devices.esp32Online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="stack-lg" style={{ gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Địa chỉ IP:</span>
              <span className="mono">{devices.ipAddress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tín hiệu Wi-Fi:</span>
              <span className="mono">{devices.wifiRssi} dBm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Giao thức Cloud:</span>
              <span>MQTT / TLS · JSON</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title"><Radio size={18} color="#818cf8" /> Đầu đọc RFID RC522</div>
            <span className="badge badge-success">SPI Ready</span>
          </div>
          <div className="stack-lg" style={{ gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>RC522 #1 (Cổng vào - SS5):</span>
              <span className="badge badge-success">{devices.rfidEntryStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>RC522 #2 (Cổng ra - SS4):</span>
              <span className="badge badge-success">{devices.rfidExitStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Servo SG90 (Vào / Ra):</span>
              <span>{devices.entryBarrier} / {devices.exitBarrier}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title"><Monitor size={18} color="#10b981" /> LCD 16x2 I2C (0x27)</div>
            <span className="badge badge-success">{devices.lcdStatus}</span>
          </div>
          <div className="lcd-screen">
            <div>SMART PARKING</div>
            <div>Slots: {availableSlots}/{totalSlots} {availableSlots === 0 ? '[FULL]' : ''}</div>
          </div>
        </div>
      </div>

      {/* Chi tiết 4 cảm biến HC-SR04 */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Activity size={20} color="#10b981" />
              <span>UC12 · Trạng thái chi tiết 4 cảm biến siêu âm HC-SR04</span>
            </div>
            <div className="card-subtitle">Theo dõi thông số đo khoảng cách và tình trạng hoạt động từng cảm biến</div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cảm biến</th>
                <th>Chân GPIO (Trig / Echo)</th>
                <th>Khoảng cách đo</th>
                <th>Trạng thái phát hiện</th>
                <th>Tình trạng phần cứng</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 1, pins: 'GPIO 25 / GPIO 26' },
                { id: 2, pins: 'GPIO 27 / GPIO 14' },
                { id: 3, pins: 'GPIO 32 / GPIO 33' },
                { id: 4, pins: 'GPIO 15 / GPIO 34' }
              ].map((meta) => {
                const slot = slots.find((s) => s.id === meta.id) || {};
                const dist = slot.distance ?? '--';
                return (
                  <tr key={meta.id}>
                    <td style={{ fontWeight: 600 }}>HC-SR04 · Vị trí #{meta.id}</td>
                    <td className="mono">{meta.pins}</td>
                    <td className="mono">{dist} cm</td>
                    <td>
                      <span className={`badge ${slot.isOccupied ? 'badge-danger' : 'badge-success'}`}>
                        {slot.isOccupied ? 'Phát hiện xe (<=15cm)' : 'Trống'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Hoạt động bình thường</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
