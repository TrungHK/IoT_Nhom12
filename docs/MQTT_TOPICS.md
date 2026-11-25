# ĐẶC TẢ GIAO THỨC MQTT (MQTT TOPIC SPECIFICATION)

Hệ thống sử dụng MQTT Broker (ví dụ: `broker.emqx.io` hoặc Mosquitto) làm trạm trung chuyển dữ liệu tốc độ cao giữa ESP32 và Node.js Backend Bridge.

---

## 1. ESP32 -> Cloud (Publish)

### 1.1. Cập nhật trạng thái bãi đỗ
- **Topic:** `smartparking/status`
- **Tần suất:** Mỗi 2 giây hoặc ngay khi có thay đổi trạng thái chiếm chỗ.
- **Payload mẫu (JSON):**
```json
{
  "available": 3,
  "total": 4,
  "slots": [
    { "id": 1, "isOccupied": true, "distance": 8.4 },
    { "id": 2, "isOccupied": false, "distance": 85.0 },
    { "id": 3, "isOccupied": false, "distance": 110.2 },
    { "id": 4, "isOccupied": false, "distance": 92.6 }
  ]
}
```

### 1.2. Sự kiện quẹt thẻ RFID
- **Topic:** `smartparking/rfid/event`
- **Tần suất:** Ngay khi phát hiện thẻ tại đầu đọc vào hoặc ra.
- **Payload mẫu (JSON):**
```json
{
  "gate": "entry",
  "uid": "E34B192A",
  "timestamp": 128450
}
```

---

## 2. Cloud -> ESP32 (Subscribe & Command)

### 2.1. Lệnh điều khiển thanh chắn thủ công
- **Topic:** `smartparking/cmd/barrier`
- **Mô tả:** Phát lệnh từ Dashboard quản trị viên yêu cầu mở cổng.
- **Payload mẫu (JSON):**
```json
{
  "gate": "entry",
  "action": "OPEN"
}
```

### 2.2. Đồng bộ danh sách thẻ hợp lệ (Whitelist)
- **Topic:** `smartparking/sync/cards`
- **Mô tả:** Đồng bộ danh sách UID được phép vào bộ nhớ cache của ESP32 nhằm hoạt động offline khi mất kết nối mạng.
```json
{
  "whitelist": ["E34B192A", "A18C339F", "72DA014C"]
}
```
