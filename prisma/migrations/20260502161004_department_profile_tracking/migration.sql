-- CreateEnum
CREATE TYPE "LabProfile" AS ENUM ('CONTINUOUS', 'PROJECTS');

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "labProfile" "LabProfile";
