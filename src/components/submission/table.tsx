"use client";

import { VisibilityState } from "@tanstack/react-table";
import { SubmissionRow } from "@/types/submission";
import Link from "next/link";

import { columns, SubmissionFlags } from "./columns";
import { DataTable } from "@/components/table/data-table";
import { VerdictCell } from "./verdict-cell";
import { ScoreCell } from "./score-cell";
import { RelativeTime } from "@/components/relative-time";
import { ChevronRight } from "lucide-react";

// Server pages cannot pass the rowHref function across the client boundary, so
// they render this instead of DataTable.
export function SubmissionTable({
  data,
  columnVisibility,
}: {
  data: SubmissionRow[];
  columnVisibility?: VisibilityState;
}) {
  // A page that hides the User column (a profile) hides it on phones too.
  const showUser = columnVisibility?.user !== false;

  return (
    <DataTable
      columns={columns}
      data={data}
      columnVisibility={columnVisibility}
      rowHref={(submission) => `/submission/${submission.id}`}
      mobileRow={(submission) => (
        <SubmissionListItem submission={submission} showUser={showUser} />
      )}
    />
  );
}

// A submission on a phone, in two lines: what it is and when, then how it
// did. Time and memory are left to the submission itself.
function SubmissionListItem({
  submission,
  showUser,
}: {
  submission: SubmissionRow;
  showUser: boolean;
}) {
  const { id, problem, user } = submission;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-medium tabular-nums">#{id}</span>
        <SubmissionFlags
          hidden={submission.hidden}
          codePublic={submission.codePublic}
        />
        <Link
          href={`/problem/${problem.id}/statement`}
          className="link-underlined ml-1 min-w-0 truncate"
        >
          {problem.title}
        </Link>
        {showUser && (
          <Link
            href={`/user/${user.id}/profile`}
            className="link-underlined shrink-0 text-muted-foreground"
          >
            {user.displayName}
          </Link>
        )}
        <span className="ml-auto shrink-0 whitespace-nowrap pl-2 text-muted-foreground">
          <RelativeTime date={new Date(submission.createdAt).toISOString()} />
        </span>
        <Link
          href={`/submission/${id}`}
          aria-label={`Open submission ${id}`}
          className="shrink-0 rounded-sm outline-none"
        >
          <ChevronRight
            aria-hidden
            className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover/row:text-foreground group-has-[a:focus-visible]/row:text-foreground"
          />
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <VerdictCell submissionId={id} testcases={problem.testcases} />
        <ScoreCell
          submissionId={id}
          problemScore={problem.score}
          testcases={problem.testcases}
        />
      </div>
    </div>
  );
}
