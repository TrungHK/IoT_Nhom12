const { getDb } = require('../config/firebase');

class CardController {
  // Danh sách toàn bộ thẻ
  async getAllCards(req, res) {
    try {
      const db = getDb();
      const snapshot = await db.ref('parking/cards').once('value');
      return res.status(200).json({ success: true, data: snapshot.val() || {} });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Thêm hoặc cập nhật thẻ
  async upsertCard(req, res) {
    try {
      const { uid, ownerName, licensePlate, phone, status } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: 'Card UID is required' });
      }

      const db = getDb();
      await db.ref(`parking/cards/${uid.toUpperCase()}`).set({
        uid: uid.toUpperCase(),
        ownerName: ownerName || 'Khách vãng lai',
        licensePlate: licensePlate || '',
        phone: phone || '',
        status: status || 'active', // 'active' | 'blocked'
        updatedAt: Date.now()
      });

      return res.status(200).json({ success: true, message: 'Card updated successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Khóa hoặc mở thẻ
  async toggleCardStatus(req, res) {
    try {
      const { uid } = req.params;
      const db = getDb();
      const cardRef = db.ref(`parking/cards/${uid.toUpperCase()}`);
      const snapshot = await cardRef.once('value');
      
      if (!snapshot.exists()) {
        return res.status(404).json({ success: false, message: 'Card not found' });
      }

      const current = snapshot.val();
      const newStatus = current.status === 'active' ? 'blocked' : 'active';
      await cardRef.update({ status: newStatus, updatedAt: Date.now() });

      return res.status(200).json({ success: true, status: newStatus });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Xóa thẻ
  async deleteCard(req, res) {
    try {
      const { uid } = req.params;
      const db = getDb();
      await db.ref(`parking/cards/${uid.toUpperCase()}`).remove();
      return res.status(200).json({ success: true, message: 'Card removed' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CardController();
