const { admin, getDb } = require('../config/firebase');

const ROLES = ['admin', 'manager', 'staff'];

async function authenticate(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
  if (!match) {
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(match[1]);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }

  try {
    const snapshot = await getDb().ref(`parking/users/${decoded.uid}`).once('value');
    const profile = snapshot.val();
    if (!profile || profile.status === 'locked') {
      return res.status(403).json({ success: false, message: 'Account is missing or locked' });
    }
    if (!ROLES.includes(profile.role)) {
      return res.status(403).json({ success: false, message: 'Account role is invalid' });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || profile.email,
      fullName: profile.fullName || decoded.name || decoded.email,
      role: profile.role
    };
    return next();
  } catch (error) {
    return res.status(503).json({ success: false, message: 'Unable to verify account status' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    return next();
  };
}

module.exports = { authenticate, allowRoles };
