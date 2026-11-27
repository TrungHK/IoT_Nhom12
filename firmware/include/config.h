#ifndef CONFIG_H
#define CONFIG_H

// ==========================================
// CẤU HÌNH WI-FI (Gateway Layer)
// ==========================================
#define WIFI_SSID           "OPPO A58"
#define WIFI_PASSWORD       "123456789"

// ==========================================
// CẤU HÌNH MQTT BROKER (Cloud / Bridge Layer)
// ==========================================
#define MQTT_SERVER         "broker.emqx.io" // Hoặc IP máy chủ / HiveMQ
#define MQTT_PORT           1883
#define MQTT_CLIENT_ID      "ESP32_SmartParking_Node01"
#define MQTT_USER           ""
#define MQTT_PASSWORD       ""

// ==========================================
// THÔNG SỐ HOẠT ĐỘNG
// ==========================================
#define TOTAL_SLOTS         4
#define DISTANCE_THRESHOLD  15.0 // Khoảng cách <= 15cm tính là có xe
#define BARRIER_OPEN_ANGLE  90
#define BARRIER_CLOSE_ANGLE 0
#define BARRIER_HOLD_TIME   4000 // Giữ thanh chắn mở 4 giây

#endif // CONFIG_H
