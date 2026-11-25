const { getMqttClient } = require('../config/mqtt');
const { getDb } = require('../config/firebase');

function startBridge() {
  const mqttClient = getMqttClient();
  const db = getDb();

  if (!mqttClient || !db) {
    console.error('[Bridge] MQTT Client or Firebase DB not initialized.');
    return;
  }

  // 1. Lắng nghe MQTT từ ESP32 -> Đồng bộ vào Firebase RTDB
  mqttClient.on('message', async (topic, message) => {
    try {
      const payloadStr = message.toString();
      const payload = JSON.parse(payloadStr);

      if (topic === 'smartparking/status') {
        // Cập nhật trạng thái bãi đỗ vào Firebase: /parking/status
        await db.ref('parking/status').set({
          availableSlots: payload.available,
          totalSlots: payload.total,
          slots: payload.slots,
          updatedAt: Date.now()
        });
      } else if (topic === 'smartparking/rfid/event') {
        // Lưu lịch sử quẹt thẻ: /parking/logs
        const logRef = db.ref('parking/logs').push();
        await logRef.set({
          gate: payload.gate,
          uid: payload.uid,
          timestamp: Date.now(),
          action: payload.gate === 'entry' ? 'IN' : 'OUT'
        });

        // Kiểm tra tính hợp lệ của thẻ trong /parking/cards/{uid}
        const cardSnapshot = await db.ref(`parking/cards/${payload.uid}`).once('value');
        const cardData = cardSnapshot.val();

        if (cardData && cardData.status === 'active') {
          console.log(`[Bridge] Valid card scanned: ${payload.uid} (${cardData.ownerName || 'Unknown'})`);
        } else {
          console.warn(`[Bridge] Unregistered or blocked card scanned: ${payload.uid}`);
        }
      }
    } catch (error) {
      console.error('[Bridge Error processing message]', error.message);
    }
  });

  // 2. Lắng nghe lệnh điều khiển từ Firebase RTDB -> Bắn MQTT xuống ESP32
  // Ví dụ admin bấm mở thanh chắn trên web: /parking/commands/barrier
  db.ref('parking/commands/barrier').on('value', (snapshot) => {
    const cmd = snapshot.val();
    if (cmd && cmd.triggerAt && Date.now() - cmd.triggerAt < 5000) {
      console.log('[Bridge] Sending Barrier Command to ESP32:', cmd);
      mqttClient.publish('smartparking/cmd/barrier', JSON.stringify({
        gate: cmd.gate,
        action: cmd.action
      }));
    }
  });

  console.log('[Bridge Service] Started two-way sync between MQTT and Firebase.');
}

module.exports = { startBridge };
