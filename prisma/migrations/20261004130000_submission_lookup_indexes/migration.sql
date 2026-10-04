-- CreateIndex
CREATE INDEX "submissions_userId_problemId_id_idx" ON "submissions"("userId", "problemId", "id");

-- CreateIndex
CREATE INDEX "submissions_problemId_userId_idx" ON "submissions"("problemId", "userId");
