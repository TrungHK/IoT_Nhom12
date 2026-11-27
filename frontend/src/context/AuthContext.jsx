import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, getAuthToken, setAuthToken } from '../services/apiClient';
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
    const token = getAuthToken();
    if (token && !token.startsWith('demo-token-')) {
      apiClient
        .getMe()
        .then((res) => {
          if (res?.data) {
            setCurrentUser(res.data);
            localStorage.setItem('sp_current_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Giữ trạng thái hiện tại nếu token chưa hợp lệ hoặc BE chưa cấu hình Firebase
        });
    }
  }, []);

  // UC01: Đăng nhập hệ thống qua Backend hoặc tài khoản Demo
  const login = async (email, password, idToken = '') => {
    setAuthLoading(true);
    try {
      // Nếu người dùng nhập Firebase ID Token trực tiếp để xác thực với Backend
      if (idToken.trim()) {
        setAuthToken(idToken.trim());
        const res = await apiClient.getMe();
        if (res?.data) {
          setCurrentUser(res.data);
          localStorage.setItem('sp_current_user', JSON.stringify(res.data));
          return { success: true, user: res.data };
        }
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (DEMO_USERS[normalizedEmail] && password === '123456') {
        const userObj = DEMO_USERS[normalizedEmail];
        setAuthToken(`demo-token-${userObj.role}`);
        setCurrentUser(userObj);
        localStorage.setItem('sp_current_user', JSON.stringify(userObj));
        // Gọi /api/auth/me để đồng bộ với Backend
        apiClient.getMe().catch(() => {});
        return { success: true, user: userObj };
      }

      return {
        success: false,
        message: 'Email hoặc mật khẩu không đúng. (Demo: dùng mật khẩu 123456 hoặc dùng nút Đăng nhập nhanh)'
      };
    } catch (error) {
      setAuthToken('');
      return {
        success: false,
        message: error.message || 'Không thể xác thực với Backend.'
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
    setAuthToken(`demo-token-${role}`);
    setCurrentUser(userObj);
    localStorage.setItem('sp_current_user', JSON.stringify(userObj));
    apiClient.getMe().catch(() => {});
    return userObj;
  };

  const logout = () => {
    setAuthToken('');
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
