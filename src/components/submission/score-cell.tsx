"use client";

import Decimal from "decimal.js";

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

  const { score, result, status } = data;

  if (isRunning) {
    return (
      <span className="flex items-center text-nowrap">
        {status}
      </span>
    );
  }

  // score and result.scores are counts of passed cases. The weighting is
  // applied here rather than stored, so that changing problemScore or a
  // subtask's weight needs no rejudge.
  const weights: number[] | undefined = result?.weights;
  const verdicts: string[][] | undefined = result?.verdicts;
  const scores: number[] | undefined = result?.scores;

  let earned: Decimal;
  let total: Decimal;

  if (weights?.length && verdicts?.length && scores?.length) {
    total = new Decimal(weights.reduce((a: number, b: number) => a + b, 0));
    earned = scores.reduce(
      (sum: Decimal, passed: number, i: number) =>
        sum.plus(new Decimal(passed).div(verdicts[i].length || 1).mul(weights[i])),
      new Decimal(0),
    );
  } else {
    // No subtasks recorded (or an errored submission): cases are the weights.
    total = new Decimal(testcases || 1);
    earned = new Decimal(score);
  }

  const display = earned.div(total).mul(problemScore).toDecimalPlaces(2).toNumber();
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
