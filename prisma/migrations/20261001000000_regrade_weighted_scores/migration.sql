-- Regrade submissions whose scores are stored in the old unit.
--
-- submissions.score and result.scores[i] used to hold weighted points on
-- problems with subtasks; they now hold counts of passed testcases, and the
-- renderers apply the weights. Left alone, these rows would display nonsense
-- (a full-marks submission reading 416/100) and keep a wrong isAccepted.
--
-- A row is in the old unit when some subtask's weight differs from its number of
-- testcases — the only case where points and counts disagree. Single-subtask
-- problems weight each subtask by its case count, so they never match.
--
-- 'In queue' rather than leaving status NULL: the UI then shows the row as
-- pending instead of rendering the old numbers with the new formula.
--
-- Every type is checked inside CASE, which Postgres evaluates in order. A plain
-- AND is not guaranteed to short-circuit, and an error here would stop the
-- frontend container from starting.
UPDATE "submissions" AS s
SET "judgeStatus" = 'pending', "priority" = 1, "attempts" = 0, "status" = 'In queue'
WHERE s."judgeStatus" = 'done'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(s."result") = 'object'
            AND jsonb_typeof(s."result"->'weights') = 'array'
           THEN s."result"->'weights'
           ELSE '[]'::jsonb
      END
    ) WITH ORDINALITY AS w(weight, i)
    WHERE CASE
      WHEN jsonb_typeof(w.weight) = 'number'
       AND jsonb_typeof(s."result"->'verdicts') = 'array'
       AND jsonb_typeof(s."result"->'verdicts'->(w.i::int - 1)) = 'array'
      THEN (w.weight)::numeric <> jsonb_array_length(s."result"->'verdicts'->(w.i::int - 1))
      ELSE false
    END
  );
