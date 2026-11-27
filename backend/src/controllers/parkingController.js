const { getDb } = require('../config/firebase');
const { getMqttClient } = require('../config/mqtt');

class ParkingController {
  // Lấy trạng thái hiện tại của bãi đỗ
  async getStatus(req, res) {
    try {
      const db = getDb();
      const snapshot = await db.ref('parking/status').once('value');
      return res.status(200).json({ success: true, data: snapshot.val() });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Điều khiển thanh chắn thủ công từ Web
  async triggerBarrier(req, res) {
    try {
      const { gate, action } = req.body; // gate: 'entry' | 'exit', action: 'OPEN' | 'CLOSE'
      if (!gate || !action) {
        return res.status(400).json({ success: false, message: 'Missing gate or action parameter' });
      }

      const mqttClient = getMqttClient();
      mqttClient.publish('smartparking/cmd/barrier', JSON.stringify({ gate, action }));

      // Ghi log lệnh vào Firebase
      const db = getDb();
      await db.ref('parking/commands/barrier').set({
        gate,
        action,
        triggerAt: Date.now(),
        by: 'AdminWeb'
      });

      return res.status(200).json({ success: true, message: `Command ${action} sent to ${gate} barrier` });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Lấy lịch sử xe vào ra
  async getLogs(req, res) {
    try {
      const db = getDb();
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
      const from = req.query.from === undefined ? undefined : Number(req.query.from);
      const to = req.query.to === undefined ? undefined : Number(req.query.to);
      if ((from !== undefined && (!Number.isFinite(from) || from < 0)) ||
          (to !== undefined && (!Number.isFinite(to) || to < 0)) ||
          (from !== undefined && to !== undefined && from > to)) {
        return res.status(400).json({ success: false, message: 'Invalid from/to timestamp range' });
      }
      if (req.query.gate && !['entry', 'exit'].includes(req.query.gate)) {
        return res.status(400).json({ success: false, message: 'gate must be entry or exit' });
      }

      let query = db.ref('parking/logs').orderByChild('timestamp');
      if (from !== undefined) query = query.startAt(from);
      if (to !== undefined) query = query.endAt(to);
      // Bound the working set while allowing server-side text and gate filtering.
      const snapshot = await query.limitToLast(2000).once('value');
      const keyword = String(req.query.q || '').trim().toLowerCase();
      const rows = Object.entries(snapshot.val() || {})
        .map(([id, log]) => ({ id, ...log }))
        .filter((log) => (!req.query.gate || log.gate === req.query.gate) &&
          (!keyword || String(log.uid || '').toLowerCase().includes(keyword) ||
            String(log.licensePlate || '').toLowerCase().includes(keyword)))
        .sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
      const start = (page - 1) * limit;
      return res.status(200).json({
        success: true,
        data: rows.slice(start, start + limit),
        pagination: { page, limit, total: rows.length, hasMore: start + limit < rows.length, scanned: snapshot.numChildren() }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ParkingController();
