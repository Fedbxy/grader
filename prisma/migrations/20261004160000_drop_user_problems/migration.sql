-- user_problems cached each user's latest submission and solved flag per
-- problem. The frontend derives both from submissions (src/utils/accepted.ts)
-- and the judge no longer writes it (Fedbxy/grader-backend#12), so the table
-- goes.

-- DropForeignKey
ALTER TABLE "user_problems" DROP CONSTRAINT "user_problems_problemId_fkey";

-- DropForeignKey
ALTER TABLE "user_problems" DROP CONSTRAINT "user_problems_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "user_problems" DROP CONSTRAINT "user_problems_userId_fkey";

-- DropTable
DROP TABLE "user_problems";
