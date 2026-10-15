"use client";

import { maps } from "@/config/messages";
import { useSubmission } from "@/hooks/submission";
import { submissionVerdict } from "@/utils/verdict";

import { CircleCheck, CircleX, FileWarning, ServerCrash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/spinner";

type VerdictCode = keyof typeof maps.submission.verdict;

// The judge reports "Running on testcase 23"; add how many there are, so the
// status shows how far along it is: "Running on testcase 23 / 50".
export function liveStatus(status: string, testcases: number) {
  return /^Running on testcase \d+$/.test(status) && testcases > 0
    ? `${status} / ${testcases}`
    : status;
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
  const verdict = submissionVerdict({ errorCode, status, score, result }, testcases);

  if (verdict.code === "running") {
    return (
      <span className={`${item} text-muted-foreground`}>
        <LoadingSpinner className="h-4 w-4" />
        {liveStatus(status, testcases)}
      </span>
    );
  }

  if (verdict.code === "CE") {
    return (
      <span className={`${item} font-medium text-amber-600 dark:text-amber-400`}>
        <FileWarning className="h-4 w-4" />
        {maps.submission.verdict.CE}
      </span>
    );
  }
  if (verdict.code === "JE" || verdict.code === "SE") {
    return (
      <span className={`${item} text-muted-foreground`}>
        <ServerCrash className="h-4 w-4" />
        {maps.submission.verdict[verdict.code]}
      </span>
    );
  }

  if (verdict.code === "AC") {
    return (
      <span className={`${item} font-medium text-constructive dark:text-green-400`}>
        <CircleCheck className="h-4 w-4" />
        {maps.submission.verdict.AC}
      </span>
    );
  }

  const label = maps.submission.verdict[verdict.code as VerdictCode] ?? verdict.code;

  return (
    <span className={`${item} font-medium text-destructive`}>
      <CircleX className="h-4 w-4" />
      {label}
      {verdict.position && (
        <span className="font-normal text-muted-foreground">
          · test {verdict.position}
        </span>
      )}
    </span>
  );
}
