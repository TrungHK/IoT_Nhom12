const { admin, getDb } = require('../config/firebase');

const VALID_ROLES = new Set(['admin', 'manager', 'staff']);
const VALID_STATUSES = new Set(['active', 'locked']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class UserController {
  async list(req, res) {
    try {
      const snapshot = await getDb().ref('parking/users').once('value');
      const users = Object.entries(snapshot.val() || {}).map(([uid, user]) => ({ uid, ...user }));
      return res.json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Unable to load users' });
    }
  }

  async create(req, res) {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;
    const role = req.body.role || 'staff';
    if (!fullName || fullName.length > 120 || !emailPattern.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid fullName and email are required' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Initial password must contain at least 8 characters' });
    }
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: 'Role must be admin, manager, or staff' });
    }

    let created;
    try {
      created = await admin.auth().createUser({ email, password, displayName: fullName, emailVerified: false });
      const profile = {
        uid: created.uid,
        email,
        fullName,
        role,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: req.user.uid
      };
      await getDb().ref(`parking/users/${created.uid}`).set(profile);
      await writeAudit(req.user, 'user.create', created.uid, { email, role });
      return res.status(201).json({ success: true, data: profile });
    } catch (error) {
      if (created) {
        try { await admin.auth().deleteUser(created.uid); } catch (_) { /* preserve original failure */ }
      }
      const duplicate = error.code === 'auth/email-already-exists';
      return res.status(duplicate ? 409 : 400).json({ success: false, message: duplicate ? 'Email is already registered' : 'Unable to create user' });
    }
  }

  async update(req, res) {
    const { uid } = req.params;
    const { fullName, role, status } = req.body;
    const updates = { updatedAt: Date.now(), updatedBy: req.user.uid };
    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 120) {
        return res.status(400).json({ success: false, message: 'fullName must contain 1 to 120 characters' });
      }
      updates.fullName = fullName.trim();
    }
    if (role !== undefined) {
      if (!VALID_ROLES.has(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
      if (uid === req.user.uid && role !== 'admin') return res.status(400).json({ success: false, message: 'You cannot remove your own admin role' });
      updates.role = role;
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) return res.status(400).json({ success: false, message: 'Status must be active or locked' });
      if (uid === req.user.uid && status === 'locked') return res.status(400).json({ success: false, message: 'You cannot lock your own account' });
      updates.status = status;
    }
    if (Object.keys(updates).length === 2) return res.status(400).json({ success: false, message: 'At least one profile field is required' });

    try {
      const ref = getDb().ref(`parking/users/${uid}`);
      const snapshot = await ref.once('value');
      if (!snapshot.exists()) return res.status(404).json({ success: false, message: 'User not found' });
      await ref.update(updates);
      if (updates.fullName) await admin.auth().updateUser(uid, { displayName: updates.fullName });
      await writeAudit(req.user, 'user.update', uid, updates);
      return res.json({ success: true, data: { uid, ...snapshot.val(), ...updates } });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Unable to update user' });
    }
  }

  async remove(req, res) {
    const { uid } = req.params;
    if (uid === req.user.uid) return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    try {
      const ref = getDb().ref(`parking/users/${uid}`);
      const snapshot = await ref.once('value');
      if (!snapshot.exists()) return res.status(404).json({ success: false, message: 'User not found' });
      const user = snapshot.val();
      await admin.auth().deleteUser(uid);
      await ref.remove();
      await writeAudit(req.user, 'user.delete', uid, { email: user.email });
      return res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Unable to delete user' });
    }
  }
}

async function writeAudit(actor, action, target, details) {
  await getDb().ref('parking/auditLogs').push({
    actorUid: actor.uid,
    actorEmail: actor.email || '',
    action,
    target,
    details,
    timestamp: Date.now()
  });
}

module.exports = { controller: new UserController(), writeAudit };
