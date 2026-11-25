# HỆ THỐNG BÃI ĐỖ XE THÔNG MINH IOT (SMART PARKING SYSTEM)

Dự án IoT hoàn chỉnh theo mô hình kiến trúc **4 lớp tiêu chuẩn**, kết hợp **ESP32**, **Node.js Backend**, **Firebase Realtime Database** và **React Dashboard**.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Iot/
├── firmware/                 # [LỚP 1] Firmware ESP32 (PlatformIO C++)
│   ├── platformio.ini        # Cấu hình board esp32dev, thư viện
│   ├── include/
│   │   ├── config.h          # Cấu hình Wi-Fi, MQTT Broker, ngưỡng khoảng cách
│   │   ├── pinout.h          # Bảng phân bổ chân GPIO, SPI, I2C, PWM
│   │   └── mqtt_topics.h     # Định nghĩa các MQTT topics
│   └── src/
│       └── main.cpp          # Vòng lặp chính, quét cảm biến, quẹt thẻ, MQTT
│
├── backend/                  # [LỚP 3] Backend Node.js (MQTT Bridge & Firebase Admin)
│   ├── package.json
│   ├── .env.example
│   ├── serviceAccountKey.json.example
│   └── src/
│       ├── server.js         # Khởi động server
│       ├── app.js            # Express app & REST API
│       ├── config/           # Cấu hình Firebase & MQTT
│       ├── services/         # Cầu nối dữ liệu MQTT <-> Firebase
│       ├── controllers/      # Bộ điều khiển API bãi xe & thẻ RFID
│       └── routes/           # Định tuyến REST
│
├── frontend/                 # [LỚP 4] Ứng dụng Web React (Vite + Tailwind CSS)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── config/firebase.js          # Kết nối Firebase Web SDK
│       ├── context/ParkingContext.jsx  # Quản lý state & lắng nghe Realtime DB
│       ├── components/
│       │   ├── common/Navbar.jsx       # Thanh điều hướng hệ thống
│       │   ├── parking/ParkingMap.jsx  # Sơ đồ trực quan 4 chỗ đỗ
│       │   ├── parking/BarrierControl.jsx # Nút mở thanh chắn khẩn cấp
│       │   └── rfid/                   # Quản lý thẻ & bảng log ra vào
│       └── App.jsx
│
├── cloud/                    # Cấu hình Cloud Firebase
│   ├── database.rules.json   # Security Rules bảo mật DB
│   └── database.schema.json  # Dữ liệu khởi tạo mẫu
│
├── docs/                     # Tài liệu kỹ thuật chi tiết
│   ├── ARCHITECTURE.md       # Giải thích chi tiết mô hình 4 lớp
│   ├── PINOUT_DIAGRAM.md     # Sơ đồ và phân bổ chân GPIO ESP32
│   └── MQTT_TOPICS.md        # Chuẩn đặc tả Topic MQTT
│
└── README.md
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Nạp Firmware ESP32 (Lớp Thiết bị)
1. Cài đặt tiện ích mở rộng **PlatformIO IDE** trong VS Code.
2. Mở thư mục `firmware/`.
3. Kiểm tra file `include/config.h` và cập nhật thông tin mạng:
   ```cpp
   #define WIFI_SSID     "Ten_Wifi_Cua_Ban"
   #define WIFI_PASSWORD "Mat_Khau_Wifi"
   ```
4. Đấu nối phần cứng theo hướng dẫn trong [docs/PINOUT_DIAGRAM.md](file:///c:/Users/doanq/.gemini/antigravity/scratch/Iot/docs/PINOUT_DIAGRAM.md).
5. Bấm nút **Build** và **Upload** để nạp code vào ESP32.

---

### 2. Cấu hình & Chạy Backend Node.js (Lớp Server/Bridge)
1. Chuyển vào thư mục backend:
   ```bash
   cd backend
   npm install
   ```
2. Tạo file cấu hình môi trường `.env`:
   ```bash
   cp .env.example .env
   ```
3. Đặt file `serviceAccountKey.json` tải từ Firebase Console vào thư mục `backend/`.
4. Chạy backend:
   ```bash
   npm run dev
   ```

---

### 3. Cấu hình & Chạy Frontend React (Lớp Ứng dụng)
1. Chuyển vào thư mục frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Tạo file cấu hình `.env` và điền Firebase config:
   ```bash
   cp .env.example .env
   ```
3. Khởi chạy giao diện phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại địa chỉ `http://localhost:3000`.

---

## ⚡ TÍNH NĂNG CHÍNH ĐÃ TRIỂN KHAI
- [x] **Giám sát trực quan:** Sơ đồ 4 vị trí đỗ xe đổi màu xanh/đỏ thời gian thực.
- [x] **Nhận diện thẻ thông minh:** Quét thẻ RC522 tại 2 cổng (vào/ra), phân quyền hợp lệ, tự động nâng thanh chắn.
- [x] **Hiển thị tại chỗ:** LCD 16x2 đếm lùi số chỗ trống `Slots: X/4`.
- [x] **Điều khiển khẩn cấp:** Nút mở thanh chắn thủ công ngay trên Dashboard Web.
- [x] **Lịch sử chi tiết:** Ghi nhận nhật ký lượt xe vào ra theo từng giây.
