-- Browser push endpoints, one row per device someone has opted in on.
--
-- Needed because a threshold breach at 03:00 currently reaches nobody: it lands in
-- SystemLog and waits for someone to open the dashboard. Push is the only channel
-- that reaches a phone without the operator going looking.
--
-- No foreign keys on departmentId/userId on purpose - see the note on the model in
-- schema.prisma. A subscription is disposable: the push service returns 404/410 for
-- an expired endpoint, and that is what deletes the row.

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_departmentId_idx" ON "PushSubscription"("departmentId");
