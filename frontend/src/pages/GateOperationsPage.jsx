import React, { useState } from 'react';
import { ScanLine, DoorOpen, DoorClosed, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function GateOperationsPage() {
  const { cards, devices, parkingStatus, verifyAndRecordGateEvent, triggerBarrier } = useParking();
  const [uidInput, setUidInput] = useState('');
  const [selectedGate, setSelectedGate] = useState('entry');
  const [feedback, setFeedback] = useState(null);

  const sampleUids = Object.keys(cards || {}).slice(0, 4);

  const handleVerifyAndRecord = async (e) => {
    e.preventDefault();
    if (!uidInput.trim()) return;
    const res = await verifyAndRecordGateEvent(uidInput, selectedGate);
    setFeedback(res);
    if (res.valid) {
      setUidInput('');
    }
  };

  return (
    <div className="stack-lg">
      <div className="grid-2">
        {/* UC10 & UC11: Xác thực thẻ RFID & Ghi nhận xe vào/ra */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ScanLine size={20} color="#60a5fa" />
                <span>UC10 & UC11 · Xác thực thẻ & Ghi nhận xe vào/ra</span>
              </div>
              <div className="card-subtitle">
                Kiểm tra tính hợp lệ của thẻ RFID tại cổng và ghi nhận lượt xe
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyAndRecord} className="stack-lg" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Chọn cổng kiểm soát</label>
              <div className="grid-2" style={{ gap: 10 }}>
                <button
                  type="button"
                  className={`btn ${selectedGate === 'entry' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedGate('entry')}
                >
                  Cổng Vào (Entry RC522)
                </button>
                <button
                  type="button"
                  className={`btn ${selectedGate === 'exit' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedGate('exit')}
                >
                  Cổng Ra (Exit RC522)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nhập hoặc quét mã UID thẻ RFID</label>
              <input
                type="text"
                className="form-control mono"
                placeholder="VD: E34B192A hoặc GUEST001"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value)}
                required
              />
            </div>

            {sampleUids.length > 0 && (
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Chọn nhanh thẻ đang có trong hệ thống:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {sampleUids.map((uid) => (
                    <button
                      key={uid}
                      type="button"
                      className="btn btn-outline mono"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => setUidInput(uid)}
                    >
                      {uid}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-success" style={{ padding: '11px 16px' }}>
              Xác thực & Ghi nhận {selectedGate === 'entry' ? 'XE VÀO' : 'XE RA'}
            </button>
          </form>

          {feedback && (
            <div className={`alert ${feedback.valid ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: 16 }}>
              {feedback.valid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.valid ? feedback.message : feedback.reason}</span>
            </div>
          )}
        </div>

        {/* Điều khiển thanh chắn thủ công & Trạng thái hiện tại */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldAlert size={20} color="#f59e0b" />
                <span>Điều khiển Thanh chắn (Servo SG90)</span>
              </div>
              <div className="card-subtitle">
                Mở cổng thủ công trong trường hợp khẩn cấp hoặc thẻ lỗi
              </div>
            </div>
            <span className="badge badge-primary">
              Còn {parkingStatus.availableSlots}/{parkingStatus.totalSlots} chỗ
            </span>
          </div>

          <div className="stack-lg" style={{ gap: 14 }}>
            <div style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>Thanh chắn Cổng Vào (GPIO 13)</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Trạng thái: <strong style={{ color: devices.entryBarrier === 'OPEN' ? 'var(--success)' : 'var(--text-primary)' }}>
                    {devices.entryBarrier === 'OPEN' ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}
                  </strong>
                </div>
              </div>
              <button
                className="btn btn-primary"
                disabled={devices.entryBarrier === 'OPEN'}
                onClick={() => triggerBarrier('entry', 'OPEN')}
              >
                {devices.entryBarrier === 'OPEN' ? <DoorOpen size={16} /> : <DoorClosed size={16} />}
                <span>{devices.entryBarrier === 'OPEN' ? 'Đang mở (4s)...' : 'Mở Cổng Vào'}</span>
              </button>
            </div>

            <div style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>Thanh chắn Cổng Ra (GPIO 12)</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Trạng thái: <strong style={{ color: devices.exitBarrier === 'OPEN' ? 'var(--success)' : 'var(--text-primary)' }}>
                    {devices.exitBarrier === 'OPEN' ? 'ĐANG MỞ' : 'ĐANG ĐÓNG'}
                  </strong>
                </div>
              </div>
              <button
                className="btn btn-primary"
                disabled={devices.exitBarrier === 'OPEN'}
                onClick={() => triggerBarrier('exit', 'OPEN')}
              >
                {devices.exitBarrier === 'OPEN' ? <DoorOpen size={16} /> : <DoorClosed size={16} />}
                <span>{devices.exitBarrier === 'OPEN' ? 'Đang mở (4s)...' : 'Mở Cổng Ra'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
