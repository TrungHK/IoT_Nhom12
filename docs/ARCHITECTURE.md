# KIẾN TRÚC HỆ THỐNG BÃI ĐỖ XE THÔNG MINH (4 LỚP)

## 1. Mô hình 4 lớp IoT (IoT 4-Layer Architecture)

```mermaid
flowchart TD
    subgraph Layer4 ["4. LỚP ỨNG DỤNG (Application Layer)"]
        ReactApp["Website React (Vite + Tailwind CSS)\n- Sơ đồ trực quan 4 chỗ đỗ\n- Quản lý danh sách thẻ RFID\n- Lịch sử xe vào / ra\n- Mở thanh chắn thủ công"]
    end

    subgraph Layer3 ["3. LỚP CLOUD & SERVER (Cloud/Server Layer)"]
        direction TB
        NodeBackend["Node.js Backend & Cầu nối\n- Express REST API\n- MQTT Client Broker Bridge\n- Firebase Admin SDK"]
        FirebaseRTDB[("Firebase Realtime Database\n- /parking/status\n- /parking/cards\n- /parking/logs\n- /parking/commands")]
        FirebaseRTDB <--> NodeBackend
    end

    subgraph Layer2 ["2. LỚP KẾT NỐI (Gateway / Connectivity Layer)"]
        Router["Router / Hotspot Wi-Fi\n- Chuyển tiếp TCP/IP ra Internet\n- MQTT / TLS"]
    end

    subgraph Layer1 ["1. LỚP THIẾT BỊ (Device Layer)"]
        ESP32["Vi điều khiển ESP32\n- Quét cảm biến, kiểm tra thẻ\n- Điều khiển thanh chắn & hiển thị"]
        Sensors["4 × HC-SR04 (Đo khoảng cách)"]
        RFID["2 × RC522 (Cổng vào & Cổng ra)"]
        Actuators["2 × Servo SG90 (Barriers)"]
        LCD["LCD 16x2 I2C (Số chỗ trống)"]

        Sensors -- GPIO Trig/Echo --> ESP32
        RFID -- SPI Bus (SS1, SS2) --> ESP32
        ESP32 -- PWM --> Actuators
        ESP32 -- I2C --> LCD
    end

    ReactApp <== HTTPS / Firebase SDK ==> FirebaseRTDB
    ReactApp -. REST API .-> NodeBackend
    NodeBackend <== MQTT / IP / TCP ==> Router
    Router <== Wi-Fi 2.4GHz ==> ESP32
```

---

## 2. Trách nhiệm của từng lớp
1. **Lớp Thiết bị (Device Layer):**
   - Vi điều khiển trung tâm ESP32 quản lý phần cứng cục bộ.
   - 4 cảm biến siêu âm HC-SR04 lấy mẫu định kỳ 2 giây/lần.
   - 2 đầu đọc RFID RC522 kiểm tra thẻ quẹt tại 2 cổng độc lập.
   - 2 động cơ servo SG90 nâng hạ thanh chắn trong 4 giây.
   - Màn hình LCD 16x2 báo số chỗ trống tức thời cho tài xế.

2. **Lớp Kết nối (Gateway Layer):**
   - Điểm truy cập Wi-Fi (Router hoặc Hotspot từ máy tính/điện thoại) cung cấp kết nối mạng TCP/IP cho ESP32.
   - Chuyển tiếp gói tin MQTT qua Internet.

3. **Lớp Cloud & Server (Cloud Layer):**
   - **MQTT Broker:** Tiếp nhận các gói tin publish từ ESP32 và định tuyến lệnh subscribe.
   - **Node.js Backend:** Chương trình cầu nối (Bridge Service) nhận dữ liệu từ MQTT, kiểm tra tính hợp lệ và ghi vào Firebase Realtime Database. Đồng thời cung cấp REST API cho quản trị.
   - **Firebase Realtime Database:** Lưu trữ thời gian thực trạng thái bãi xe, thẻ xe, nhật ký, phân quyền qua Firebase Security Rules.

4. **Lớp Ứng dụng (Application Layer):**
   - Ứng dụng Web Single Page Application (SPA) phát triển bằng React.
   - Đồng bộ hai chiều với Firebase Realtime Database qua Firebase Web SDK.
   - Giao diện trực quan gồm: Sơ đồ vị trí 4 ô đỗ, điều khiển mở cổng khẩn cấp, quản lý danh sách thẻ, bảng log lịch sử.
