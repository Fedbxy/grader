"use client";

import { useSubmission } from "@/hooks/submission";
import { displayPoints, scoreFraction } from "@/utils/score";

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

  const { score, result, status } = data;

  if (isRunning) {
    return (
      <span className="flex items-center text-nowrap">
        {status}
      </span>
    );
  }

  const { earned, total } = scoreFraction(score, result, testcases);
  const display = displayPoints(earned, total, problemScore);
  const percent = earned.div(total).mul(100).toNumber();

  const variant = earned.equals(total)
    ? "constructive"
    : earned.isZero()
      ? "destructive"
      : "warning";

  // Written out rather than interpolated: Tailwind only emits classes it can
  // see as complete strings in the source.
  const textClass = {
    constructive: "text-constructive",
    destructive: "text-destructive",
    warning: "text-warning",
  }[variant];

  return (
    <div className="flex flex-col">
      <span className={textClass}>
        {display} / {problemScore}
      </span>
      <Progress
        className="h-2 w-16 md:w-32"
        variant={variant}
        value={percent}
      />
    </div>
  );
}
