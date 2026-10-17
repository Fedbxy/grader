-- CreateTable
CREATE TABLE "runs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "language" "Language" NOT NULL,
    "code" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "judgeStatus" "JudgeStatus" NOT NULL DEFAULT 'pending',
    "status" TEXT DEFAULT 'In queue',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verdict" TEXT,
    "exitCode" INTEGER,
    "exitSignal" INTEGER,
    "stdout" TEXT,
    "stdoutTruncated" BOOLEAN NOT NULL DEFAULT false,
    "stderr" TEXT,
    "stderrTruncated" BOOLEAN NOT NULL DEFAULT false,
    "time" DOUBLE PRECISION,
    "memory" DOUBLE PRECISION,
    "errorCode" TEXT,
    "error" TEXT,
    "runTokens" DOUBLE PRECISION NOT NULL,
    "runTokensAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "runs_userId_key" ON "runs"("userId");

-- CreateIndex
CREATE INDEX "runs_judgeStatus_id_idx" ON "runs"("judgeStatus", "id");

-- CreateIndex
CREATE INDEX "runs_createdAt_idx" ON "runs"("createdAt");

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Wake-up notification for runs. The judge LISTENs on one channel, so runs
-- share 'submission_queued' with submissions; the 'run:' prefix is only a
-- hint of what woke it. As with submissions, the payload is never a work
-- assignment: the judge's poll loop claims pending rows, and these only make
-- it check sooner.
CREATE OR REPLACE FUNCTION notify_run_queued() RETURNS trigger AS $$
BEGIN
  IF NEW."judgeStatus" = 'pending' THEN
    PERFORM pg_notify('submission_queued', 'run:' || NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER run_queued
AFTER INSERT OR UPDATE OF "judgeStatus" ON "runs"
FOR EACH ROW EXECUTE FUNCTION notify_run_queued();
