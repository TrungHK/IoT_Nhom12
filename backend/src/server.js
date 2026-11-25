require('dotenv').config();
const app = require('./app');
const { initFirebase } = require('./config/firebase');
const { initMQTT } = require('./config/mqtt');
const { startBridge } = require('./services/bridgeService');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // 1. Khởi tạo Firebase Admin
    initFirebase();

    // 2. Khởi tạo MQTT Client
    initMQTT();

    // 3. Khởi chạy cầu nối MQTT <-> Firebase
    startBridge();

    // 4. Khởi chạy REST API Server
    app.listen(PORT, () => {
      console.log(`==============================================`);
      console.log(`🚀 Smart Parking Backend running on port ${PORT}`);
      console.log(`📡 REST API: http://localhost:${PORT}/api`);
      console.log(`==============================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();
