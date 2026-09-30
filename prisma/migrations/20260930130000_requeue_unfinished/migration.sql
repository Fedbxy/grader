-- Requeue submissions the old judge never finished.
--
-- db_queue marked every existing submission 'done'. That includes ones the old
-- HTTP judge was still grading when this deploy replaced it, and ones its
-- in-memory queue stranded long ago (lost on a restart, or left behind by the
-- setInterval poller dying). Neither ever received a result.
--
-- A finished submission always has status NULL: the old poller cleared it on
-- both its success and error paths. So a non-NULL status on a 'done' row means
-- it was never finished. Priority 1 keeps these behind live submissions.
UPDATE "submissions" SET "judgeStatus" = 'pending', "priority" = 1
WHERE "judgeStatus" = 'done' AND "status" IS NOT NULL;
