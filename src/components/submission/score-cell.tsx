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

  const { score, result } = data;

  // The live status ("Running on testcase 2") is shown by the verdict.
  if (isRunning) {
    return <span className="text-muted-foreground">—</span>;
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
  // The theme's dark-mode green and orange are dark enough for fills but too
  // dark for text, so the text is lighter in dark mode.
  const textClass = {
    constructive: "text-constructive dark:text-green-400",
    destructive: "text-destructive",
    warning: "text-warning dark:text-amber-400",
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
