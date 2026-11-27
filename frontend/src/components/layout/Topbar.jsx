import React from 'react';
import { Menu, Wifi, Server } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export default function Topbar({ title, onOpenMobile }) {
  const { devices, backendConnected } = useParking();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onOpenMobile}>
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="status-pill">
          <span className={`dot ${devices.esp32Online ? 'dot-online' : 'dot-offline'}`} />
          <Wifi size={14} />
          <span>ESP32 {devices.esp32Online ? 'Online' : 'Offline'}</span>
        </div>
        <div className="status-pill">
          <span className={`dot ${backendConnected ? 'dot-online' : 'dot-offline'}`} />
          <Server size={14} color="#60a5fa" />
          <span>Backend API</span>
        </div>
      </div>
    </header>
  );
}
