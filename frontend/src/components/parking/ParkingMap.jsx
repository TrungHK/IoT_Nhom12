import React from 'react';
import { Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export default function ParkingMap() {
  const { parkingStatus } = useParking();
  const { slots = [], availableSlots = 0, totalSlots = 4 } = parkingStatus;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Sơ đồ vị trí đỗ xe (Thời gian thực)</h2>
          <p className="text-sm text-slate-400">Giám sát qua 4 cảm biến siêu âm HC-SR04</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-emerald-400">{availableSlots}</span>
          <span className="text-slate-400 text-sm">/ {totalSlots} chỗ trống</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((slot) => {
          const isOccupied = slot.isOccupied;
          return (
            <div
              key={slot.id}
              className={`relative rounded-xl p-5 border-2 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px] ${
                isOccupied
                  ? 'bg-rose-950/30 border-rose-600/70 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-500/70 text-emerald-200'
              }`}
            >
              <div className="w-full flex justify-between items-center text-xs font-semibold uppercase tracking-wider">
                <span>Vị trí #{slot.id}</span>
                {isOccupied ? (
                  <span className="flex items-center text-rose-400 gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Có xe
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-400 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trống
                  </span>
                )}
              </div>

              <div className="my-3">
                <Car
                  className={`w-14 h-14 transition-transform duration-300 ${
                    isOccupied ? 'text-rose-500 scale-110' : 'text-slate-600 opacity-40'
                  }`}
                />
              </div>

              <div className="text-xs text-slate-400">
                Khoảng cách: <span className="font-mono text-slate-200">{slot.distance ?? '--'} cm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
