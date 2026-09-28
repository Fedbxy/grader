-- The queued state had two labels: rows were created with the default
-- 'Pending', then the judge's HTTP handshake overwrote it with 'In queue'
-- within ~500ms. One state, so one label -- and 'In queue' is the one users saw.
--
-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'In queue';
