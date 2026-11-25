import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../config/firebase';

const ParkingContext = createContext(null);

export const ParkingProvider = ({ children }) => {
  const [parkingStatus, setParkingStatus] = useState({
    availableSlots: 4,
    totalSlots: 4,
    slots: [
      { id: 1, isOccupied: false, distance: 100 },
      { id: 2, isOccupied: false, distance: 100 },
      { id: 3, isOccupied: false, distance: 100 },
      { id: 4, isOccupied: false, distance: 100 }
    ],
    updatedAt: Date.now()
  });

  const [logs, setLogs] = useState([]);
  const [cards, setCards] = useState({});
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 1. Lắng nghe trạng thái chỗ đỗ theo thời gian thực
    const statusRef = ref(db, 'parking/status');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParkingStatus(data);
      }
    });

    // 2. Lắng nghe lịch sử vào ra
    const logsRef = ref(db, 'parking/logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setLogs(logArray);
      }
    });

    // 3. Lắng nghe danh sách thẻ RFID
    const cardsRef = ref(db, 'parking/cards');
    const unsubscribeCards = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCards(data);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeLogs();
      unsubscribeCards();
    };
  }, []);

  // Điều khiển mở thanh chắn từ xa
  const triggerBarrier = async (gate, action = 'OPEN') => {
    try {
      const cmdRef = ref(db, 'parking/commands/barrier');
      await set(cmdRef, {
        gate,
        action,
        triggerAt: Date.now(),
        by: 'AdminDashboard'
      });
      return true;
    } catch (err) {
      console.error('Trigger barrier error:', err);
      return false;
    }
  };

  return (
    <ParkingContext.Provider value={{
      parkingStatus,
      logs,
      cards,
      isConnected,
      triggerBarrier
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);
