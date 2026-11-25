import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, push, update, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { ROLES } from '../utils/permissions';

const ParkingContext = createContext(null);

const INITIAL_SLOTS = [
  { id: 1, isOccupied: true, distance: 8.4 },
  { id: 2, isOccupied: false, distance: 112.0 },
  { id: 3, isOccupied: false, distance: 118.5 },
  { id: 4, isOccupied: true, distance: 11.2 }
];

const INITIAL_CARDS = {
  E34B192A: {
    uid: 'E34B192A',
    cardType: 'resident',
    ownerName: 'Nguyễn Văn An',
    apartment: 'P1204 - Tòa A',
    licensePlate: '29A-123.45',
    phone: '0912345678',
    status: 'active',
    createdAt: Date.now() - 86400000 * 10
  },
  A18C339F: {
    uid: 'A18C339F',
    cardType: 'resident',
    ownerName: 'Trần Thị Bình',
    apartment: 'P0802 - Tòa B',
    licensePlate: '30E-888.88',
    phone: '0987654321',
    status: 'active',
    createdAt: Date.now() - 86400000 * 5
  },
  GUEST001: {
    uid: 'GUEST001',
    cardType: 'guest',
    ownerName: 'Khách vãng lai #01',
    licensePlate: '29H-567.89',
    phone: '0901122334',
    status: 'active',
    issuedBy: 'Nhân viên bãi đỗ',
    createdAt: Date.now() - 3600000 * 2
  }
};

const INITIAL_LOGS = [
  { id: 'log-1', gate: 'entry', uid: 'E34B192A', action: 'IN', cardType: 'resident', licensePlate: '29A-123.45', result: 'SUCCESS', timestamp: Date.now() - 7200000 },
  { id: 'log-2', gate: 'entry', uid: 'GUEST001', action: 'IN', cardType: 'guest', licensePlate: '29H-567.89', result: 'SUCCESS', timestamp: Date.now() - 3600000 },
  { id: 'log-3', gate: 'exit', uid: 'A18C339F', action: 'OUT', cardType: 'resident', licensePlate: '30E-888.88', result: 'SUCCESS', timestamp: Date.now() - 1800000 }
];

const INITIAL_USERS = {
  'demo-admin-01': {
    uid: 'demo-admin-01',
    fullName: 'Lê Hoàng Admin',
    email: 'admin@smartparking.vn',
    role: ROLES.ADMIN,
    status: 'active',
    createdAt: Date.now() - 86400000 * 30
  },
  'demo-manager-01': {
    uid: 'demo-manager-01',
    fullName: 'Nguyễn Minh Quân',
    email: 'manager@smartparking.vn',
    role: ROLES.MANAGER,
    status: 'active',
    createdAt: Date.now() - 86400000 * 20
  },
  'demo-staff-01': {
    uid: 'demo-staff-01',
    fullName: 'Trần Văn Hùng',
    email: 'staff@smartparking.vn',
    role: ROLES.STAFF,
    status: 'active',
    createdAt: Date.now() - 86400000 * 15
  }
};

export const ParkingProvider = ({ children }) => {
  const [parkingStatus, setParkingStatus] = useState({
    availableSlots: 2,
    totalSlots: 4,
    slots: INITIAL_SLOTS,
    updatedAt: Date.now()
  });
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [devices, setDevices] = useState({
    esp32Online: true,
    wifiRssi: -58,
    ipAddress: '192.168.1.105',
    entryBarrier: 'CLOSED',
    exitBarrier: 'CLOSED',
    rfidEntryStatus: 'OK',
    rfidExitStatus: 'OK',
    lcdStatus: 'OK'
  });

  useEffect(() => {
    const statusRef = ref(db, 'parking/status');
    const unsubStatus = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setParkingStatus(data);
    });

    const logsRef = ref(db, 'parking/logs');
    const unsubLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] })).reverse();
        setLogs(arr);
      }
    });

    const cardsRef = ref(db, 'parking/cards');
    const unsubCards = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCards(data);
    });

    const usersRef = ref(db, 'parking/users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(data);
    });

    return () => {
      unsubStatus();
      unsubLogs();
      unsubCards();
      unsubUsers();
    };
  }, []);

  const upsertCard = async (cardData) => {
    const uid = cardData.uid.trim().toUpperCase();
    const payload = {
      ...cardData,
      uid,
      status: cardData.status || 'active',
      updatedAt: Date.now(),
      createdAt: cardData.createdAt || Date.now()
    };

    setCards((prev) => ({ ...prev, [uid]: payload }));
    try {
      await set(ref(db, `parking/cards/${uid}`), payload);
    } catch {
      // Offline fallback
    }
    return payload;
  };

  const toggleCardStatus = async (uid) => {
    const current = cards[uid];
    if (!current) return;
    const newStatus = current.status === 'active' ? 'blocked' : 'active';
    setCards((prev) => ({ ...prev, [uid]: { ...prev[uid], status: newStatus } }));
    try {
      await update(ref(db, `parking/cards/${uid}`), { status: newStatus, updatedAt: Date.now() });
    } catch {
      // Offline fallback
    }
  };

  const deleteCard = async (uid) => {
    setCards((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
    try {
      await remove(ref(db, `parking/cards/${uid}`));
    } catch {
      // Offline fallback
    }
  };

  const triggerBarrier = async (gate, action = 'OPEN') => {
    setDevices((prev) => ({
      ...prev,
      [gate === 'entry' ? 'entryBarrier' : 'exitBarrier']: action === 'OPEN' ? 'OPEN' : 'CLOSED'
    }));

    if (action === 'OPEN') {
      setTimeout(() => {
        setDevices((prev) => ({
          ...prev,
          [gate === 'entry' ? 'entryBarrier' : 'exitBarrier']: 'CLOSED'
        }));
      }, 4000);
    }

    try {
      await set(ref(db, 'parking/commands/barrier'), {
        gate,
        action,
        triggerAt: Date.now(),
        by: 'WebApp'
      });
    } catch {
      // Offline fallback
    }
  };

  const verifyAndRecordGateEvent = async (rawUid, gate) => {
    const uid = rawUid.trim().toUpperCase();
    const card = cards[uid];

    if (!card) {
      return { valid: false, reason: `Thẻ ${uid} chưa được đăng ký trong hệ thống.` };
    }
    if (card.status !== 'active') {
      return { valid: false, reason: `Thẻ ${uid} đang bị khóa.` };
    }
    if (gate === 'entry' && parkingStatus.availableSlots <= 0) {
      return { valid: false, reason: 'Bãi đỗ xe đã đầy (0 chỗ trống). Không thể cho xe vào.' };
    }

    const logEntry = {
      gate,
      uid,
      action: gate === 'entry' ? 'IN' : 'OUT',
      cardType: card.cardType || 'resident',
      licensePlate: card.licensePlate || '---',
      ownerName: card.ownerName || 'Khách',
      result: 'SUCCESS',
      timestamp: Date.now()
    };

    const newId = `log-${Date.now()}`;
    setLogs((prev) => [{ id: newId, ...logEntry }, ...prev]);

    try {
      await push(ref(db, 'parking/logs'), logEntry);
    } catch {
      // Offline fallback
    }

    await triggerBarrier(gate, 'OPEN');

    return {
      valid: true,
      card,
      logEntry,
      message: `Xác thực thành công! Đã mở cổng ${gate === 'entry' ? 'VÀO' : 'RA'} cho xe ${card.licensePlate || uid}.`
    };
  };

  const upsertUser = async (userData) => {
    const uid = userData.uid || `user-${Date.now()}`;
    const payload = {
      uid,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || ROLES.STAFF,
      status: userData.status || 'active',
      createdAt: userData.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    setUsers((prev) => ({ ...prev, [uid]: payload }));
    try {
      await set(ref(db, `parking/users/${uid}`), payload);
    } catch {
      // Offline fallback
    }
    return payload;
  };

  const deleteUser = async (uid) => {
    setUsers((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
    try {
      await remove(ref(db, `parking/users/${uid}`));
    } catch {
      // Offline fallback
    }
  };

  return (
    <ParkingContext.Provider value={{
      parkingStatus,
      logs,
      cards,
      users,
      devices,
      upsertCard,
      toggleCardStatus,
      deleteCard,
      triggerBarrier,
      verifyAndRecordGateEvent,
      upsertUser,
      deleteUser
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);
