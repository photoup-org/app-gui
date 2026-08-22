-- Record WHICH sensor channel each calibration applied to. Without it a
-- calibration table can show when a device was calibrated but not whether it was
-- the pH probe or the turbidity probe, and the per-device lastCalibrated /
-- calibrationDueDate columns cannot distinguish them either.
--
-- Purely additive: the column is nullable, so rows written before it existed stay
-- valid and simply report an unknown channel.

-- AlterTable
ALTER TABLE "CalibrationRecord" ADD COLUMN     "metric" TEXT;

-- CreateIndex
CREATE INDEX "CalibrationRecord_deviceId_metric_calibratedAt_idx" ON "CalibrationRecord"("deviceId", "metric", "calibratedAt" DESC);
