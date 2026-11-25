#ifndef MQTT_TOPICS_H
#define MQTT_TOPICS_H

// ==========================================
// MQTT TOPICS SPECIFICATION
// ESP32 <-> MQTT Broker <-> Node.js Bridge <-> Firebase
// ==========================================

// Publish từ ESP32 lên Cloud
#define TOPIC_PARKING_STATUS     "smartparking/status"       // Báo cáo số chỗ trống, trạng thái 4 ô
#define TOPIC_RFID_EVENT         "smartparking/rfid/event"   // Quẹt thẻ vào hoặc ra
#define TOPIC_TELEMETRY          "smartparking/telemetry"    // Trạng thái phần cứng, IP, RSSI

// Subscribe từ Cloud xuống ESP32
#define TOPIC_BARRIER_CMD        "smartparking/cmd/barrier"  // Lệnh mở/đóng thanh chắn thủ công
#define TOPIC_CARDS_SYNC         "smartparking/sync/cards"   // Đồng bộ danh sách thẻ hợp lệ (whitelist)

#endif // MQTT_TOPICS_H
