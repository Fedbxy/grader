/*
  Warnings:

  - You are about to drop the column `memory` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `verdict` on the `submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "memory",
DROP COLUMN "time",
DROP COLUMN "verdict",
ADD COLUMN     "result" JSONB DEFAULT '[]',
ADD COLUMN     "status" TEXT DEFAULT 'Pending';
