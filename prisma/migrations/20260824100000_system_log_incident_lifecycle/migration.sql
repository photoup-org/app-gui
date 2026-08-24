-- Incident lifecycle on SystemLog: deduplication and acknowledgement.
--
-- Two problems this solves. First, a repeating condition floods the feed: the
-- edge re-raises the same threshold breach every 60 seconds, so a week-long
-- excursion writes roughly 10,000 identical rows. Second, there is no way to mark
-- one as handled, so nothing can distinguish "seen and dealt with" from "nobody
-- has looked at this yet".
--
-- Ingest folds a repeat into the newest unacknowledged row carrying the same
-- dedupKey, bumping occurrences and lastSeenAt. Acknowledging closes that row, so
-- the next occurrence opens a fresh one.
--
-- Purely additive. Every column is nullable or defaulted, so existing readers and
-- existing rows are unaffected; a row written before this migration reports one
-- occurrence and no acknowledgement, which is exactly right.

-- AlterTable
ALTER TABLE "SystemLog" ADD COLUMN     "dedupKey" TEXT,
ADD COLUMN     "occurrences" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "acknowledgedBy" TEXT;

-- CreateIndex
-- Serves the ingest lookup: newest unacknowledged row for one department and key.
CREATE INDEX "SystemLog_departmentId_dedupKey_acknowledgedAt_idx" ON "SystemLog"("departmentId", "dedupKey", "acknowledgedAt");
