-- Device <-> Project becomes many-to-many, so one reactor can be shared by
-- several projects. Exclusivity moves from "who owns the device" to "who is
-- running it right now": a device already attached to a PLANNED/RUNNING/PAUSED
-- experiment cannot be picked up by another run, so two projects may list the
-- same reactor but can never use it simultaneously.
--
-- ORDER MATTERS. `prisma migrate diff` emits the DROP COLUMN before the join
-- table exists, which would silently discard every existing assignment. The
-- table is created and backfilled first, and the column only dropped once its
-- data has been copied across.

-- CreateTable
CREATE TABLE "_DeviceProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeviceProjects_AB_unique" ON "_DeviceProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_DeviceProjects_B_index" ON "_DeviceProjects"("B");

-- AddForeignKey
ALTER TABLE "_DeviceProjects" ADD CONSTRAINT "_DeviceProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeviceProjects" ADD CONSTRAINT "_DeviceProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: carry every existing single-project assignment into the join table.
-- "A" is Device.id and "B" is Project.id, matching the foreign keys above.
INSERT INTO "_DeviceProjects" ("A", "B")
SELECT "id", "projectId" FROM "Device" WHERE "projectId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_projectId_fkey";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "projectId";
