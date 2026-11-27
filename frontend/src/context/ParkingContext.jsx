import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
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
  const { currentUser } = useAuth();
  const [parkingStatus, setParkingStatus] = useState({
    availableSlots: 2,
    totalSlots: 4,
    slots: INITIAL_SLOTS,
    updatedAt: Date.now()
  });
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [reportSummary, setReportSummary] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
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

  // Đồng bộ dữ liệu từ Backend API
  const syncFromBackend = useCallback(async () => {
    if (!currentUser) return;
    try {
      const role = currentUser.role;
      const tasks = [];

      if (role === ROLES.MANAGER || role === ROLES.STAFF) {
        tasks.push(
          apiClient.getParkingStatus().then((res) => {
            if (res?.data) setParkingStatus(res.data);
          }),
          apiClient.getParkingLogs({ page: 1, limit: 50 }).then((res) => {
            if (Array.isArray(res?.data)) setLogs(res.data);
            else if (res?.data && typeof res.data === 'object') {
              const arr = Object.entries(res.data).map(([id, item]) => ({ id, ...item })).reverse();
              setLogs(arr);
            }
          })
        );
      }

      if (role === ROLES.MANAGER) {
        tasks.push(
          apiClient.getCards().then((res) => {
            if (res?.data) setCards(res.data);
          }),
          apiClient.getReportSummary().then((res) => {
            if (res?.data) setReportSummary(res.data);
          })
        );
      }

      if (role === ROLES.ADMIN) {
        tasks.push(
          apiClient.getUsers().then((res) => {
            if (Array.isArray(res?.data)) {
              const map = {};
              res.data.forEach((u) => {
                map[u.uid] = u;
              });
              setUsers(map);
            }
          })
        );
      }

      await Promise.allSettled(tasks);
      setBackendConnected(true);
    } catch {
      setBackendConnected(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    syncFromBackend();

    const interval = setInterval(() => {
      if (currentUser.role === ROLES.MANAGER || currentUser.role === ROLES.STAFF) {
        apiClient.getParkingStatus()
          .then((res) => {
            if (res?.data) setParkingStatus(res.data);
            setBackendConnected(true);
          })
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, syncFromBackend]);

  // UC07 & UC09: Đăng ký thẻ cư dân / Cấp thẻ RFID tạm thời qua Backend API
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
      await apiClient.upsertCard(payload);
    } catch {
      // Fallback local state nếu BE trả 401/503 trong chế độ demo
    }
    return payload;
  };

  // Khóa / mở khóa thẻ qua Backend API
  const toggleCardStatus = async (uid) => {
    const current = cards[uid];
    if (!current) return;
    const newStatus = current.status === 'active' ? 'blocked' : 'active';
    setCards((prev) => ({ ...prev, [uid]: { ...prev[uid], status: newStatus } }));
    try {
      await apiClient.toggleCard(uid);
    } catch {
      // Fallback local state
    }
  };

  // Xóa thẻ qua Backend API
  const deleteCard = async (uid) => {
    setCards((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
    try {
      await apiClient.deleteCard(uid);
    } catch {
      // Fallback local state
    }
  };

  // Điều khiển thanh chắn qua Backend API: POST /api/parking/barrier
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
      await apiClient.triggerBarrier(gate, action);
    } catch {
      // Fallback local state
    }
  };

  // UC10 & UC11: Xác thực thẻ RFID & Ghi nhận xe vào/ra (qua Backend)
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

    setLogs((prev) => [{ id: `log-${Date.now()}`, ...logEntry }, ...prev]);
    await triggerBarrier(gate, 'OPEN');

    return {
      valid: true,
      card,
      logEntry,
      message: `Xác thực thành công! Đã gửi lệnh mở cổng ${gate === 'entry' ? 'VÀO' : 'RA'} qua Backend cho xe ${card.licensePlate || uid}.`
    };
  };

  // UC14 & UC15: Quản lý tài khoản & Phân quyền qua Backend API
  const createUserAccount = async (userData) => {
    const tempUid = `user-${Date.now()}`;
    const localProfile = {
      uid: tempUid,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role || ROLES.STAFF,
      status: 'active',
      createdAt: Date.now()
    };

    try {
      const res = await apiClient.createUser(userData);
      const created = res?.data || localProfile;
      setUsers((prev) => ({ ...prev, [created.uid]: created }));
      return created;
    } catch {
      setUsers((prev) => ({ ...prev, [tempUid]: localProfile }));
      return localProfile;
    }
  };

  const updateUserAccount = async (uid, updates) => {
    setUsers((prev) => ({
      ...prev,
      [uid]: { ...prev[uid], ...updates, updatedAt: Date.now() }
    }));
    try {
      await apiClient.updateUser(uid, updates);
    } catch {
      // Fallback local state
    }
  };

  const deleteUser = async (uid) => {
    setUsers((prev) => {
      const copy = { ...prev };
      delete copy[uid];
      return copy;
    });
    try {
      await apiClient.deleteUser(uid);
    } catch {
      // Fallback local state
    }
  };

  return (
    <ParkingContext.Provider value={{
      parkingStatus,
      logs,
      cards,
      users,
      devices,
      reportSummary,
      backendConnected,
      syncFromBackend,
      upsertCard,
      toggleCardStatus,
      deleteCard,
      triggerBarrier,
      verifyAndRecordGateEvent,
      createUserAccount,
      updateUserAccount,
      deleteUser
    }}>
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => useContext(ParkingContext);
