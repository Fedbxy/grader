"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSubmission } from "@/hooks/submission";
import { liveStatus } from "@/components/submission/verdict-cell";
import { LoadingSpinner } from "@/components/ui/spinner";

// Polls a submission that is still judged, the way the submission page does,
// and refreshes the page once it finishes so everything on it is recomputed.
// Refreshes once per mount, so a stale row cannot loop. Returns the live
// status text, the server's until the first answer.
function useJudging(submissionId: number, initialStatus: string, testcases: number) {
  const router = useRouter();
  const { data, isLoading, isRunning } = useSubmission(submissionId);
  const refreshed = useRef(false);
  const finished = !isLoading && !isRunning;

  useEffect(() => {
    if (finished && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
  }, [finished, router]);

  return liveStatus(isLoading || !data?.status ? initialStatus : data.status, testcases);
}

// The viewer's newest submission that is still being judged.
export function JudgingStrip({
  submissionId,
  problemTitle,
  status,
  testcases,
}: {
  submissionId: number;
  problemTitle: string;
  status: string;
  testcases: number;
}) {
  const live = useJudging(submissionId, status, testcases);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2.5 text-sm">
      <LoadingSpinner className="h-4 w-4 shrink-0" />
      <span className="min-w-0 font-medium">
        Submission #{submissionId} · {problemTitle}
      </span>
      <span className="text-muted-foreground">{live}</span>
      <Link href={`/submission/${submissionId}`} className="link-underlined ml-auto">
        Open submission
      </Link>
    </div>
  );
}
