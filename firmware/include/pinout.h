#ifndef PINOUT_H
#define PINOUT_H

// ==========================================
// 1. I2C LCD 16x2
// ==========================================
#define PIN_I2C_SDA         21
#define PIN_I2C_SCL         22
#define LCD_I2C_ADDR        0x27

// ==========================================
// 2. SPI RC522 RFID READERS (Chung SCK, MISO, MOSI)
// ==========================================
#define PIN_SPI_SCK         18
#define PIN_SPI_MISO        19
#define PIN_SPI_MOSI        23

#define PIN_RFID_ENTRY_SS    5   // Slave Select cho đầu đọc vào
#define PIN_RFID_EXIT_SS     4   // Slave Select cho đầu đọc ra
#define PIN_RFID_RST         2   // Reset chung cho 2 đầu đọc

// ==========================================
// 3. PWM SERVOS (SG90)
// ==========================================
#define PIN_SERVO_ENTRY     13   // Cổng vào
#define PIN_SERVO_EXIT      12   // Cổng ra

// ==========================================
// 4. HC-SR04 ULTRASONIC SENSORS (4 Chỗ đỗ)
// Lưu ý: Chân Echo 5V từ cảm biến phải qua cầu phân áp (1k-2k) xuống ~3.3V
// ==========================================
#define PIN_TRIG_SLOT_1     25
#define PIN_ECHO_SLOT_1     26

#define PIN_TRIG_SLOT_2     27
#define PIN_ECHO_SLOT_2     14

#define PIN_TRIG_SLOT_3     32
#define PIN_ECHO_SLOT_3     33

#define PIN_TRIG_SLOT_4     15
#define PIN_ECHO_SLOT_4     34   // GPIO 34 là Input-only trên ESP32

#endif // PINOUT_H
