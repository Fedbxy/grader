"use client";

import { useSubmission } from "@/hooks/submission";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function ScoreCell({
  submissionId,
  problemScore,
  testcases,
}: {
  submissionId: number;
  problemScore: number;
  testcases: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);

  if (isLoading) {
    return <Skeleton className="h-8" />;
  }

  const { score, verdict } = data;

  if (isRunning) {
    return (
      <span className="flex items-center text-nowrap">
        {verdict[0]}
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span
        className={
          score === testcases
            ? "text-constructive"
            : score === 0
              ? "text-destructive"
              : "text-warning"
        }
      >
        {(score * problemScore) / testcases} / {problemScore}
      </span>
      <Progress
        className="h-2 w-16 md:w-32"
        variant={
          score === testcases
            ? "constructive"
            : score === 0
              ? "destructive"
              : "warning"
        }
        value={(score * 100) / testcases}
      />
    </div>
  );
}
