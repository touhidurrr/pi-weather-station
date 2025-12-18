-- CreateTable
CREATE TABLE "TemperatureReading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "temperature" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "TemperatureReading_timestamp_idx" ON "TemperatureReading"("timestamp");
