import React, { useState } from 'react';
import { DoorClosed, DoorOpen, ShieldAlert } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export default function BarrierControl() {
  const { triggerBarrier } = useParking();
  const [loadingGate, setLoadingGate] = useState(null);

  const handleOpen = async (gate) => {
    setLoadingGate(gate);
    await triggerBarrier(gate, 'OPEN');
    setTimeout(() => {
      setLoadingGate(null);
    }, 4000);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-semibold text-white">Điều khiển Thanh chắn Thủ công (Servo SG90)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Dành cho quản trị viên/nhân viên trong trường hợp thẻ hỏng hoặc xử lý khẩn cấp.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cổng vào */}
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-slate-200">Cổng Vào (Entry Gate)</h4>
            <span className="text-xs text-slate-400">RC522 #1 · Servo 1 (Pin 13)</span>
          </div>
          <button
            onClick={() => handleOpen('entry')}
            disabled={loadingGate === 'entry'}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loadingGate === 'entry' ? (
              <>
                <DoorOpen className="w-4 h-4 animate-bounce" />
                <span>Đang mở (4s)...</span>
              </>
            ) : (
              <>
                <DoorClosed className="w-4 h-4" />
                <span>Mở Cổng Vào</span>
              </>
            )}
          </button>
        </div>

        {/* Cổng ra */}
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-slate-200">Cổng Ra (Exit Gate)</h4>
            <span className="text-xs text-slate-400">RC522 #2 · Servo 2 (Pin 12)</span>
          </div>
          <button
            onClick={() => handleOpen('exit')}
            disabled={loadingGate === 'exit'}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {loadingGate === 'exit' ? (
              <>
                <DoorOpen className="w-4 h-4 animate-bounce" />
                <span>Đang mở (4s)...</span>
              </>
            ) : (
              <>
                <DoorClosed className="w-4 h-4" />
                <span>Mở Cổng Ra</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
