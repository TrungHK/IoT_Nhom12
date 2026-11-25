import React from 'react';
import { History, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export default function LogTable() {
  const { logs } = useParking();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <History className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-semibold text-white">Lịch sử Xe Vào / Ra (Thời gian thực)</h3>
      </div>

      <div className="overflow-x-auto max-h-[300px]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 sticky top-0">
            <tr>
              <th className="py-2.5 px-3">Thời gian</th>
              <th className="py-2.5 px-3">Cổng</th>
              <th className="py-2.5 px-3">UID Thẻ</th>
              <th className="py-2.5 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-slate-500">Chưa có sự kiện nào</td>
              </tr>
            ) : (
              logs.slice(0, 15).map((log) => {
                const isEntry = log.gate === 'entry' || log.action === 'IN';
                const formattedTime = new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-750">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-xs">{formattedTime}</td>
                    <td className="py-2.5 px-3 uppercase font-semibold text-xs text-slate-200">
                      {isEntry ? 'Cổng Vào' : 'Cổng Ra'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{log.uid}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          isEntry
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800'
                        }`}
                      >
                        {isEntry ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" /> Vào bãi
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> Ra bãi
                          </>
                        )}
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
