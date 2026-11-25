# BẢNG PHÂN BỔ CHÂN (PINOUT) ESP32 DEVKIT V1 CHO HỆ THỐNG BÃI XE

> [!WARNING]
> **CẢNH BÁO MỨC ĐIỆN ÁP:** 
> - Cảm biến siêu âm **HC-SR04** hoạt động ở mức **5V**. Tín hiệu chân **Echo** trả về mức 5V sẽ gây hỏng chân GPIO của ESP32 (chỉ chịu tối đa 3.3V).
> - **BẮT BUỘC** dùng mạch phân áp gồm 2 điện trở (ví dụ: $R_1 = 1k\Omega$, $R_2 = 2k\Omega$) từ Echo về GND để hạ áp xuống $\approx 3.3V$ trước khi nối vào chân Echo GPIO của ESP32.
> - Hai động cơ Servo SG90 tiêu thụ dòng lớn khi khởi động, **CẦN CẤP NGUỒN 5V NGOÀI** và nối chung chân **GND** với ESP32 để tránh reset vi điều khiển.

---

## 1. Màn hình LCD 16x2 (I2C)
| Chân LCD I2C Module | Chân ESP32 | Ghi chú |
| :--- | :--- | :--- |
| **GND** | GND | Nối mass chung |
| **VCC** | 5V (VIN) | Cấp nguồn 5V cho đèn nền LCD |
| **SDA** | **GPIO 21** | Đường dữ liệu I2C |
| **SCL** | **GPIO 22** | Đường xung nhịp I2C |

---

## 2. Hai đầu đọc thẻ RFID RC522 (Giao tiếp SPI)
Cả 2 đầu đọc **dùng chung** bus SPI chuẩn (SCK, MISO, MOSI, RST). Phân biệt bằng chân **SS / SDA** riêng biệt:

| Chân RC522 | RC522 Cổng Vào (Entry) | RC522 Cổng Ra (Exit) | Chân ESP32 | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **3.3V** | 3.3V | 3.3V | **3V3** | **Tuyệt đối không cấp 5V vào RC522** |
| **GND** | GND | GND | **GND** | Mass chung |
| **RST** | RST | RST | **GPIO 2** | Nối chung chân Reset |
| **MISO** | MISO | MISO | **GPIO 19** | SPI Master In Slave Out (Chung) |
| **MOSI** | MOSI | MOSI | **GPIO 23** | SPI Master Out Slave In (Chung) |
| **SCK** | SCK | SCK | **GPIO 18** | SPI Clock (Chung) |
| **SDA / SS** | **SDA** | — | **GPIO 5** | **Slave Select Đầu đọc 1** |
| **SDA / SS** | — | **SDA** | **GPIO 4** | **Slave Select Đầu đọc 2** |

---

## 3. Hai động cơ Servo SG90 (PWM Điều khiển Thanh chắn)
| Linh kiện | Chân tín hiệu | Chân ESP32 | Nguồn cấp |
| :--- | :--- | :--- | :--- |
| **Servo Cổng Vào** | Vàng / Cam (Signal) | **GPIO 13** | 5V Ngoài (Đỏ) + GND chung (Nâu/Đen) |
| **Servo Cổng Ra** | Vàng / Cam (Signal) | **GPIO 12** | 5V Ngoài (Đỏ) + GND chung (Nâu/Đen) |

---

## 4. Bốn Cảm biến Siêu âm HC-SR04 (Đo khoảng cách vị trí đỗ)
| Vị trí | Chân Trig (Output từ ESP32) | Chân Echo (Input vào ESP32 qua cầu phân áp) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Ô số 1 (Slot 1)** | **GPIO 25** | **GPIO 26** | Phân áp Echo 5V -> 3.3V |
| **Ô số 2 (Slot 2)** | **GPIO 27** | **GPIO 14** | Phân áp Echo 5V -> 3.3V |
| **Ô số 3 (Slot 3)** | **GPIO 32** | **GPIO 33** | Phân áp Echo 5V -> 3.3V |
| **Ô số 4 (Slot 4)** | **GPIO 15** | **GPIO 34** | GPIO 34 là Input-only, rất chuẩn cho Echo |
