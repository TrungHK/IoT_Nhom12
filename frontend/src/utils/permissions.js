// Định nghĩa vai trò và phân quyền theo đúng sơ đồ Use Case

export const ROLES = {
  MANAGER: 'manager',
  STAFF: 'staff',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.MANAGER]: 'Quản lý bãi đỗ xe',
  [ROLES.STAFF]: 'Nhân viên bãi đỗ',
  [ROLES.ADMIN]: 'Quản trị viên hệ thống'
};

export const ROLE_PERMISSIONS = {
  [ROLES.MANAGER]: [
    'overview',         // UC02, UC03, UC04
    'history',          // UC05
    'resident-cards',   // UC06, UC07
    'guest-cards',      // UC08, UC09
    'reports'           // UC13
  ],
  [ROLES.STAFF]: [
    'overview',         // UC02, UC03, UC04
    'history',          // UC05
    'guest-cards',      // UC09 (Cấp thẻ RFID tạm thời)
    'gate-ops',         // UC10 (Xác thực thẻ RFID), UC11 (Ghi nhận xe vào/ra)
    'devices'           // UC12 (Theo dõi trạng thái thiết bị)
  ],
  [ROLES.ADMIN]: [
    'accounts',         // UC14 (Quản lý tài khoản)
    'permissions'       // UC15 (Phân quyền người dùng)
  ]
};

export function hasAccess(role, pageKey) {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(pageKey);
}

export function getDefaultPageForRole(role) {
  if (role === ROLES.ADMIN) return 'accounts';
  return 'overview';
}
