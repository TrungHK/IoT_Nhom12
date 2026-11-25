import React from 'react';
import Navbar from './components/common/Navbar';
import ParkingMap from './components/parking/ParkingMap';
import BarrierControl from './components/parking/BarrierControl';
import CardList from './components/rfid/CardList';
import LogTable from './components/rfid/LogTable';
import { ParkingProvider } from './context/ParkingContext';

function App() {
  return (
    <ParkingProvider>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Navbar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Hàng 1: Sơ đồ bãi xe & Điều khiển thanh chắn */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ParkingMap />
            </div>
            <div>
              <BarrierControl />
            </div>
          </div>

          {/* Hàng 2: Quản lý thẻ RFID & Lịch sử xe vào ra */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardList />
            <LogTable />
          </div>
        </main>

        <footer className="bg-slate-950 border-t border-slate-800 text-center py-4 text-xs text-slate-500">
          IoT Smart Parking System © 2026 · Kiến trúc 4 lớp ESP32 - Router - Firebase - React
        </footer>
      </div>
    </ParkingProvider>
  );
}

export default App;
