#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>

#include "pinout.h"
#include "config.h"
#include "mqtt_topics.h"

// ==========================================
// ĐỐI TƯỢNG PHẦN CỨNG
// ==========================================
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);
MFRC522 rfidEntry(PIN_RFID_ENTRY_SS, PIN_RFID_RST);
MFRC522 rfidExit(PIN_RFID_EXIT_SS, PIN_RFID_RST);
Servo servoEntry;
Servo servoExit;

WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Biến trạng thái
struct Slot {
    int id;
    int trigPin;
    int echoPin;
    float distance;
    bool isOccupied;
};

Slot slots[TOTAL_SLOTS] = {
    {1, PIN_TRIG_SLOT_1, PIN_ECHO_SLOT_1, 0, false},
    {2, PIN_TRIG_SLOT_2, PIN_ECHO_SLOT_2, 0, false},
    {3, PIN_TRIG_SLOT_3, PIN_ECHO_SLOT_3, 0, false},
    {4, PIN_TRIG_SLOT_4, PIN_ECHO_SLOT_4, 0, false}
};

int availableSlots = TOTAL_SLOTS;
unsigned long lastSensorCheck = 0;
unsigned long lastMqttReport = 0;

// ==========================================
// HÀM ĐO KHOẢNG CÁCH SIÊU ÂM
// ==========================================
float measureDistance(int trigPin, int echoPin) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    
    long duration = pulseIn(echoPin, HIGH, 30000); // Timeout 30ms (~5m)
    if (duration == 0) return 999.0;
    return (duration * 0.0343) / 2.0;
}

// ==========================================
// CẬP NHẬT MÀN HÌNH LCD
// ==========================================
void updateLCD(int available) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SMART PARKING");
    lcd.setCursor(0, 1);
    lcd.print("Slots: ");
    lcd.print(available);
    lcd.print("/");
    lcd.print(TOTAL_SLOTS);
    if (available == 0) {
        lcd.print(" [FULL]");
    }
}

// ==========================================
// ĐIỀU KHIỂN THANH CHẮN
// ==========================================
void openEntryBarrier() {
    servoEntry.write(BARRIER_OPEN_ANGLE);
    delay(BARRIER_HOLD_TIME);
    servoEntry.write(BARRIER_CLOSE_ANGLE);
}

void openExitBarrier() {
    servoExit.write(BARRIER_OPEN_ANGLE);
    delay(BARRIER_HOLD_TIME);
    servoExit.write(BARRIER_CLOSE_ANGLE);
}

// ==========================================
// MQTT CALLBACK & RECONNECT
// ==========================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.printf("[MQTT RX] Topic: %s | Payload: %s\n", topic, message.c_str());

    // Xử lý lệnh mở cổng từ xa
    if (String(topic) == TOPIC_BARRIER_CMD) {
        JsonDocument doc;
        deserializeJson(doc, message);
        String gate = doc["gate"] | "";
        String action = doc["action"] | "";
        
        if (action == "OPEN") {
            if (gate == "entry") openEntryBarrier();
            else if (gate == "exit") openExitBarrier();
        }
    }
}

void reconnectMQTT() {
    while (!mqttClient.connected()) {
        Serial.print("Connecting to MQTT Broker...");
        if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
            Serial.println("connected!");
            mqttClient.subscribe(TOPIC_BARRIER_CMD);
            mqttClient.subscribe(TOPIC_CARDS_SYNC);
        } else {
            Serial.printf("failed, rc=%d. Retrying in 3s...\n", mqttClient.state());
            delay(3000);
        }
    }
}

// ==========================================
// SETUP
// ==========================================
void setup() {
    Serial.begin(115200);
    SPI.begin(PIN_SPI_SCK, PIN_SPI_MISO, PIN_SPI_MOSI);

    // Khởi tạo LCD
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("System Booting...");

    // Khởi tạo Servo
    servoEntry.attach(PIN_SERVO_ENTRY);
    servoExit.attach(PIN_SERVO_EXIT);
    servoEntry.write(BARRIER_CLOSE_ANGLE);
    servoExit.write(BARRIER_CLOSE_ANGLE);

    // Khởi tạo Chân cảm biến siêu âm
    for (int i = 0; i < TOTAL_SLOTS; i++) {
        pinMode(slots[i].trigPin, OUTPUT);
        pinMode(slots[i].echoPin, INPUT);
    }

    // Khởi tạo 2 đầu đọc RFID RC522
    rfidEntry.PCD_Init();
    rfidExit.PCD_Init();

    // Kết nối WiFi
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());

    // Kết nối MQTT
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);

    updateLCD(availableSlots);
}

// ==========================================
// LOOP
// ==========================================
void loop() {
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();

    // 1. Quét cảm biến siêu âm mỗi 2 giây
    if (millis() - lastSensorCheck >= 2000) {
        lastSensorCheck = millis();
        int occupiedCount = 0;

        for (int i = 0; i < TOTAL_SLOTS; i++) {
            slots[i].distance = measureDistance(slots[i].trigPin, slots[i].echoPin);
            bool state = (slots[i].distance <= DISTANCE_THRESHOLD && slots[i].distance > 1.0);
            slots[i].isOccupied = state;
            if (state) occupiedCount++;
        }

        int newAvailable = TOTAL_SLOTS - occupiedCount;
        if (newAvailable != availableSlots) {
            availableSlots = newAvailable;
            updateLCD(availableSlots);
        }

        // Báo cáo trạng thái lên MQTT định kỳ hoặc khi có thay đổi
        JsonDocument doc;
        doc["available"] = availableSlots;
        doc["total"] = TOTAL_SLOTS;
        JsonArray arr = doc["slots"].to<JsonArray>();
        for (int i = 0; i < TOTAL_SLOTS; i++) {
            JsonObject obj = arr.add<JsonObject>();
            obj["id"] = slots[i].id;
            obj["isOccupied"] = slots[i].isOccupied;
            obj["distance"] = round(slots[i].distance * 10) / 10.0;
        }
        String output;
        serializeJson(doc, output);
        mqttClient.publish(TOPIC_PARKING_STATUS, output.c_str());
    }

    // 2. Quét thẻ vào
    if (rfidEntry.PICC_IsNewCardPresent() && rfidEntry.PICC_ReadCardSerial()) {
        String uid = "";
        for (byte i = 0; i < rfidEntry.uid.size; i++) {
            uid += String(rfidEntry.uid.uidByte[i] < 0x10 ? "0" : "");
            uid += String(rfidEntry.uid.uidByte[i], HEX);
        }
        uid.toUpperCase();
        Serial.printf("[ENTRY RFID] Card UID: %s\n", uid.c_str());

        // Gửi event lên Cloud
        JsonDocument doc;
        doc["gate"] = "entry";
        doc["uid"] = uid;
        doc["timestamp"] = millis();
        String payload;
        serializeJson(doc, payload);
        mqttClient.publish(TOPIC_RFID_EVENT, payload.c_str());

        // Kiểm tra điều kiện mở cổng (còn chỗ và thẻ hợp lệ)
        if (availableSlots > 0) {
            openEntryBarrier();
        }

        rfidEntry.PICC_HaltA();
        rfidEntry.PCD_StopCrypto1();
    }

    // 3. Quét thẻ ra
    if (rfidExit.PICC_IsNewCardPresent() && rfidExit.PICC_ReadCardSerial()) {
        String uid = "";
        for (byte i = 0; i < rfidExit.uid.size; i++) {
            uid += String(rfidExit.uid.uidByte[i] < 0x10 ? "0" : "");
            uid += String(rfidExit.uid.uidByte[i], HEX);
        }
        uid.toUpperCase();
        Serial.printf("[EXIT RFID] Card UID: %s\n", uid.c_str());

        JsonDocument doc;
        doc["gate"] = "exit";
        doc["uid"] = uid;
        doc["timestamp"] = millis();
        String payload;
        serializeJson(doc, payload);
        mqttClient.publish(TOPIC_RFID_EVENT, payload.c_str());

        openExitBarrier();

        rfidExit.PICC_HaltA();
        rfidExit.PCD_StopCrypto1();
    }
}
