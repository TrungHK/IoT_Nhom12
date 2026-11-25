import React from 'react';
import { ShieldCheck, Wifi, Car, Database } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Car className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">SMART PARKING IOT</h1>
          <p className="text-xs text-slate-400">Kiến trúc 4 lớp: Thiết bị · Gateway · Cloud · Web</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-300">ESP32 Online</span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-slate-300">Firebase RTDB</span>
        </div>
      </div>
    </header>
  );
}
