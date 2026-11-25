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
      const snapshot = await db.ref('parking/logs').limitToLast(50).once('value');
      return res.status(200).json({ success: true, data: snapshot.val() });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ParkingController();
