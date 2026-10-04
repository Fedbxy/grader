-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: admins test their own problems, and from now on their submissions are
-- hidden at creation. Mark the existing ones the same way so they stop cluttering
-- the public lists and the accepted counts.
UPDATE "submissions" SET "hidden" = true WHERE "userId" IN (SELECT "id" FROM "users" WHERE "role" = 'admin');
