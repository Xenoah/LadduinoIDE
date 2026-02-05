// Ladduino Runtime ESP32 (MVP)
#include <Arduino.h>

void ladderTask(void* arg) {
  while (true) {
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void commTask(void* arg) {
  while (true) {
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

void setup() {
  Serial.begin(921600);
  xTaskCreatePinnedToCore(ladderTask, "ladder", 8192, nullptr, 4, nullptr, 1);
  xTaskCreatePinnedToCore(commTask, "comm", 6144, nullptr, 3, nullptr, 0);
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}
