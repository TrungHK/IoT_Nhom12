import React, { useState } from 'react';
import { History, Search, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useParking } from '../context/ParkingContext';

export default function HistoryPage() {
  const { logs } = useParking();
  const [search, setSearch] = useState('');
  const [gateFilter, setGateFilter] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchGate = gateFilter === 'all' || log.gate === gateFilter;
    const keyword = search.trim().toLowerCase();
    const matchKeyword =
      !keyword ||
      (log.uid || '').toLowerCase().includes(keyword) ||
      (log.licensePlate || '').toLowerCase().includes(keyword);
    return matchGate && matchKeyword;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <History size={20} color="#60a5fa" />
            <span>UC05 · Lịch sử xe vào / ra</span>
          </div>
          <div className="card-subtitle">Tra cứu toàn bộ sự kiện quẹt thẻ RFID tại cổng vào và cổng ra</div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm UID thẻ hoặc biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 160 }}
            value={gateFilter}
            onChange={(e) => setGateFilter(e.target.value)}
          >
            <option value="all">Tất cả các cổng</option>
            <option value="entry">Chỉ Cổng vào</option>
            <option value="exit">Chỉ Cổng ra</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Cổng</th>
              <th>UID Thẻ RFID</th>
              <th>Loại thẻ</th>
              <th>Biển số xe</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isEntry = log.gate === 'entry' || log.action === 'IN';
                return (
                  <tr key={log.id}>
                    <td className="mono">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                    <td>{isEntry ? 'Cổng Vào' : 'Cổng Ra'}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{log.uid}</td>
                    <td>
                      <span className={`badge ${log.cardType === 'resident' ? 'badge-primary' : 'badge-warning'}`}>
                        {log.cardType === 'resident' ? 'Cư dân' : 'Khách vãng lai'}
                      </span>
                    </td>
                    <td>{log.licensePlate || '---'}</td>
                    <td>
                      <span className={`badge ${isEntry ? 'badge-success' : 'badge-info'}`}>
                        {isEntry ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                        {isEntry ? 'Vào bãi' : 'Ra bãi'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
