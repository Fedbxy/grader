"use client";

import { maps } from "@/config/messages";
import { useSubmission } from "@/hooks/submission";

import { CircleCheck, CircleX, FileWarning, ServerCrash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/spinner";

type VerdictCode = keyof typeof maps.submission.verdict;

// The first testcase that did not pass, walking the subtasks in order, with its
// 1-based position across all of them. A skipped case (SKP, not run because an
// earlier one failed) only names the failure when nothing else failed. Null
// when every case passed (or there are none to look at).
function firstFailure(verdicts: string[][] | undefined) {
  let position = 0;
  let skipped: { verdict: string; position: number } | null = null;

  for (const subtask of verdicts ?? []) {
    for (const verdict of subtask) {
      position++;
      if (verdict === "AC") continue;
      if (verdict === "SKP") {
        skipped ??= { verdict, position };
        continue;
      }
      return { verdict, position };
    }
  }

  return skipped;
}

export function VerdictCell({
  submissionId,
  testcases,
}: {
  submissionId: number;
  testcases: number;
}) {
  const { data, isLoading, isRunning } = useSubmission(submissionId);
  const item = "inline-flex items-center gap-1.5 whitespace-nowrap";

  if (isLoading) {
    return <Skeleton className="h-8" />;
  }

  const { score, result, status, errorCode } = data;

  if (isRunning) {
    return (
      <span className={`${item} text-muted-foreground`}>
        <LoadingSpinner className="h-4 w-4" />
        {status}
      </span>
    );
  }

  if (errorCode === "CE") {
    return (
      <span className={`${item} font-medium text-amber-600 dark:text-amber-400`}>
        <FileWarning className="h-4 w-4" />
        {maps.submission.verdict.CE}
      </span>
    );
  }
  if (errorCode === "JE" || errorCode === "SE") {
    return (
      <span className={`${item} text-muted-foreground`}>
        <ServerCrash className="h-4 w-4" />
        {maps.submission.verdict[errorCode as VerdictCode]}
      </span>
    );
  }

  // The same rule as utils/accepted.ts: no error, and every testcase passed.
  if (!errorCode && testcases > 0 && score === testcases) {
    return (
      <span className={`${item} font-medium text-constructive dark:text-green-400`}>
        <CircleCheck className="h-4 w-4" />
        {maps.submission.verdict.AC}
      </span>
    );
  }

  const failure = firstFailure(result?.verdicts);
  const label = failure
    ? (maps.submission.verdict[failure.verdict as VerdictCode] ?? failure.verdict)
    : maps.submission.verdict.WA;

  return (
    <span className={`${item} font-medium text-destructive`}>
      <CircleX className="h-4 w-4" />
      {label}
      {failure && (
        <span className="font-normal text-muted-foreground">
          · test {failure.position}
        </span>
      )}
    </span>
  );
}
