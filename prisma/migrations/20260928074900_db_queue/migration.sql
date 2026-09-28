-- CreateEnum
CREATE TYPE "JudgeStatus" AS ENUM ('pending', 'judging', 'done', 'failed');

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "testcaseVersion" TEXT;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "judgeStatus" "JudgeStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "submissions_judgeStatus_priority_id_idx" ON "submissions"("judgeStatus", "priority", "id");

-- Backfill: every existing submission has already been judged. Without this they all
-- default to 'pending' and the worker regrades the entire history on first boot.
-- Safe inside the migration transaction: no window where a worker could observe them.
UPDATE "submissions" SET "judgeStatus" = 'done';

-- Wake-up notification. The worker LISTENs on this channel; the payload is a hint to
-- try claiming, never a work assignment. Correctness rests on the worker's poll loop,
-- not on delivery of these.
CREATE OR REPLACE FUNCTION notify_submission_queued() RETURNS trigger AS $$
BEGIN
  IF NEW."judgeStatus" = 'pending' THEN
    PERFORM pg_notify('submission_queued', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_queued
AFTER INSERT OR UPDATE OF "judgeStatus" ON "submissions"
FOR EACH ROW EXECUTE FUNCTION notify_submission_queued();
