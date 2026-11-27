// Frontend chỉ giao tiếp duy nhất với Backend Node.js qua REST API (/api/*)

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function getAuthToken() {
  return localStorage.getItem('sp_auth_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('sp_auth_token', token);
  } else {
    localStorage.removeItem('sp_auth_token');
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  // Auth
  getMe: () => request('/api/auth/me'),

  // Parking
  getParkingStatus: () => request('/api/parking/status'),
  triggerBarrier: (gate, action = 'OPEN') =>
    request('/api/parking/barrier', {
      method: 'POST',
      body: JSON.stringify({ gate, action })
    }),
  getParkingLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/api/parking/logs${qs ? `?${qs}` : ''}`);
  },

  // Cards
  getCards: () => request('/api/cards'),
  upsertCard: (cardData) =>
    request('/api/cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    }),
  toggleCard: (uid) =>
    request(`/api/cards/${encodeURIComponent(uid)}/toggle`, {
      method: 'PATCH'
    }),
  deleteCard: (uid) =>
    request(`/api/cards/${encodeURIComponent(uid)}`, {
      method: 'DELETE'
    }),

  // Users (Admin)
  getUsers: () => request('/api/users'),
  createUser: (userData) =>
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  updateUser: (uid, updates) =>
    request(`/api/users/${encodeURIComponent(uid)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  deleteUser: (uid) =>
    request(`/api/users/${encodeURIComponent(uid)}`, {
      method: 'DELETE'
    }),

  // Reports
  getReportSummary: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const qs = query.toString();
    return request(`/api/reports/summary${qs ? `?${qs}` : ''}`);
  }
};
