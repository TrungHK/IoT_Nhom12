import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/auth';
import { ref as dbRef, get as dbGet } from 'firebase/database';
import { auth, db } from '../config/firebase';
import { ROLES, ROLE_LABELS } from '../utils/permissions';

const AuthContext = createContext(null);

const DEMO_USERS = {
  'manager@smartparking.vn': {
    uid: 'demo-manager-01',
    email: 'manager@smartparking.vn',
    fullName: 'Nguyễn Minh Quân',
    role: ROLES.MANAGER,
    status: 'active'
  },
  'staff@smartparking.vn': {
    uid: 'demo-staff-01',
    email: 'staff@smartparking.vn',
    fullName: 'Trần Văn Hùng',
    role: ROLES.STAFF,
    status: 'active'
  },
  'admin@smartparking.vn': {
    uid: 'demo-admin-01',
    email: 'admin@smartparking.vn',
    fullName: 'Lê Hoàng Admin',
    role: ROLES.ADMIN,
    status: 'active'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sp_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Lắng nghe trạng thái Firebase Auth nếu có sử dụng Firebase thật
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const snapshot = await dbGet(dbRef(db, `parking/users/${fbUser.uid}`));
          const userData = snapshot.val();
          const merged = {
            uid: fbUser.uid,
            email: fbUser.email,
            fullName: userData?.fullName || fbUser.email.split('@')[0],
            role: userData?.role || ROLES.STAFF,
            status: userData?.status || 'active'
          };
          setCurrentUser(merged);
          localStorage.setItem('sp_current_user', JSON.stringify(merged));
        } catch {
          // Fallback nếu chưa có RTDB rules
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // UC01: Đăng nhập hệ thống
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Kiểm tra tài khoản Demo / Local trước (thuận tiện khi chạy đồ án offline/chưa gắn key)
      if (DEMO_USERS[normalizedEmail] && password === '123456') {
        const userObj = DEMO_USERS[normalizedEmail];
        setCurrentUser(userObj);
        localStorage.setItem('sp_current_user', JSON.stringify(userObj));
        return { success: true, user: userObj };
      }

      // 2. Đăng nhập qua Firebase Authentication thật
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const fbUser = credential.user;
      const snapshot = await dbGet(dbRef(db, `parking/users/${fbUser.uid}`));
      const userData = snapshot.val();

      if (userData?.status === 'locked') {
        await signOut(auth);
        return { success: false, message: 'Tài khoản đã bị khóa bởi Quản trị viên.' };
      }

      const userObj = {
        uid: fbUser.uid,
        email: fbUser.email,
        fullName: userData?.fullName || fbUser.email,
        role: userData?.role || ROLES.STAFF,
        status: 'active'
      };
      setCurrentUser(userObj);
      localStorage.setItem('sp_current_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (error) {
      return {
        success: false,
        message: 'Email hoặc mật khẩu không chính xác. (Demo: dùng mật khẩu 123456)'
      };
    } finally {
      setAuthLoading(false);
    }
  };

  const quickLoginByRole = (role) => {
    const emailMap = {
      [ROLES.MANAGER]: 'manager@smartparking.vn',
      [ROLES.STAFF]: 'staff@smartparking.vn',
      [ROLES.ADMIN]: 'admin@smartparking.vn'
    };
    const userObj = DEMO_USERS[emailMap[role]];
    setCurrentUser(userObj);
    localStorage.setItem('sp_current_user', JSON.stringify(userObj));
    return userObj;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore if offline
    }
    setCurrentUser(null);
    localStorage.removeItem('sp_current_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      roleLabel: currentUser ? ROLE_LABELS[currentUser.role] : '',
      authLoading,
      login,
      quickLoginByRole,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
