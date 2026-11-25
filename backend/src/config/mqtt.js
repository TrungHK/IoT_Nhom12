const mqtt = require('mqtt');

let client = null;

function initMQTT() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
  const options = {
    clientId: process.env.MQTT_CLIENT_ID || `Backend_Bridge_${Math.random().toString(16).substring(2, 8)}`,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    reconnectPeriod: 3000
  };

  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log(`[MQTT] Connected to Broker: ${brokerUrl}`);
    // Subscribe các topic nhận từ ESP32
    client.subscribe('smartparking/status');
    client.subscribe('smartparking/rfid/event');
    client.subscribe('smartparking/telemetry');
  });

  client.on('error', (err) => {
    console.error('[MQTT Error]', err.message);
  });

  return client;
}

module.exports = {
  initMQTT,
  getMqttClient: () => client
};
