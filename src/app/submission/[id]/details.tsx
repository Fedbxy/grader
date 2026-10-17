import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";
import { publicUserSelect } from "@/lib/select";
import { maps } from "@/config/messages";
import {
  canShareCode,
  canViewCode,
  canViewSubmission,
} from "@/utils/submission";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verdict } from "./verdict";
import { SubmissionModal } from "./modal";
import { Path } from "@/components/path";
import { LocalTime } from "@/components/local-time";
import { RelativeTime } from "@/components/relative-time";
import { VerdictCell } from "@/components/submission/verdict-cell";
import { ScoreCell } from "@/components/submission/score-cell";
import { TimeCell } from "@/components/submission/time-cell";
import { MemoryCell } from "@/components/submission/memory-cell";
import { CodeView } from "@/components/submission/code-view";
import {
  CopyLinkButton,
  CopyPageLinkButton,
  HideButton,
  RejudgeButton,
  ShareSwitch,
} from "./buttons";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Info, Lock, Send, Share2, UserRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// The page and the intercepting modal both render this, so one fetch and one
// permission check cover both.
export async function SubmissionDetails({
  id,
  variant,
}: {
  id: string;
  variant: "page" | "modal";
}) {
  if (isNaN(Number(id))) {
    notFound();
  }

  const submission = await prisma.submission.findUnique({
    where: { id: Number(id) },
    include: {
      problem: true,
      user: { select: publicUserSelect },
    },
  });
  const { user } = await validateRequest();
  if (!submission || !canViewSubmission(user, submission)) {
    notFound();
  }

  const language =
    maps.language[submission.language as keyof typeof maps.language] ||
    submission.language;

  const stats = (
    <div className="grid grid-cols-3 divide-x rounded-md border text-center">
      {[
        {
          key: "score",
          label: "Score",
          value: (
            <ScoreCell
              submissionId={submission.id}
              problemScore={submission.problem.score}
              testcases={submission.problem.testcases}
            />
          ),
        },
        {
          key: "time",
          label: <InfoLabel info={MAX_TIME}>Time</InfoLabel>,
          value: (
            <TimeCell
              submissionId={submission.id}
              timeLimit={submission.problem.timeLimit}
            />
          ),
        },
        {
          key: "memory",
          label: <InfoLabel info={MAX_MEMORY}>Memory</InfoLabel>,
          value: (
            <MemoryCell
              submissionId={submission.id}
              memoryLimit={submission.problem.memoryLimit}
            />
          ),
        },
      ].map(({ key, label, value }) => (
        <div key={key} className="flex flex-col items-center gap-1 px-2 py-3">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className="text-sm font-medium">{value}</div>
        </div>
      ))}
    </div>
  );

  const codeVisible = canViewCode(user, submission);
  const code = (
    <>
      {codeVisible ? (
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b bg-muted/40 px-3 py-2">
            {submission.codePublic ? (
              <Badge variant="secondary" className="gap-1.5">
                <Share2 className="h-3 w-3" />
                {user?.id === submission.userId
                  ? "Shared"
                  : `Shared by ${submission.user.displayName}`}
                {submission.hidden && " · hidden from others"}
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {canShareCode(user, submission) && (
                <>
                  <ShareSwitch
                    id={submission.id}
                    codePublic={submission.codePublic}
                    hidden={submission.hidden}
                  />
                  <Separator
                    orientation="vertical"
                    className="mx-1 hidden h-5 sm:block"
                  />
                </>
              )}
              {submission.codePublic && <CopyLinkButton />}
              {user?.role === "admin" && (
                <>
                  <HideButton
                    id={submission.id}
                    hidden={submission.hidden}
                  />
                  <RejudgeButton id={submission.id} />
                </>
              )}
            </div>
          </div>
          <CodeView
            code={submission.code}
            language={submission.language}
            title={language}
          />
        </Card>
      ) : (
        <Card className="border border-dashed py-0 ring-0">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">This code is private</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Only {submission.user.displayName} and admins can see it.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );

  if (variant === "modal") {
    return (
      <SubmissionModal
        id={submission.id}
        hidden={submission.hidden}
        description={[
          <ProblemLink key="problem" problem={submission.problem} />,
          <UserLink key="user" user={submission.user} />,
          language,
          <LocalTime key="time" date={submission.createdAt.toISOString()} />,
        ]}
      >
        <div className="flex flex-col space-y-4">
          {stats}
          <Verdict
            submissionId={submission.id}
            testcases={submission.problem.testcases}
            problemScore={submission.problem.score}
            openSubtasks="first-failing"
            compact
          />
          {code}
        </div>
      </SubmissionModal>
    );
  }

  const problemId = submission.problem.id;
  const summary = [
    {
      key: "time",
      label: <InfoLabel info={MAX_TIME}>Execution time</InfoLabel>,
      value: (
        <>
          <TimeCell
            submissionId={submission.id}
            timeLimit={submission.problem.timeLimit}
          />
          <Limit>/ {submission.problem.timeLimit} ms</Limit>
        </>
      ),
    },
    {
      key: "memory",
      label: <InfoLabel info={MAX_MEMORY}>Memory</InfoLabel>,
      value: (
        <>
          <MemoryCell
            submissionId={submission.id}
            memoryLimit={submission.problem.memoryLimit}
          />
          <Limit>/ {submission.problem.memoryLimit} MB</Limit>
        </>
      ),
    },
    { key: "language", label: "Language", value: <span>{language}</span> },
    {
      key: "submitted",
      label: "Submitted",
      value: <LocalTime date={submission.createdAt.toISOString()} />,
    },
  ];

  const tests = (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Tests</h2>
      <Verdict
        submissionId={submission.id}
        testcases={submission.problem.testcases}
        problemScore={submission.problem.score}
        openSubtasks="failing"
        compact
      />
    </section>
  );

  // Fixed places: Tests then Code (or the private notice) in the wide column,
  // Summary alone on the right. The Summary comes first in the DOM so phones read Summary, Tests,
  // Code; on wide screens the grid pins it to the right column.
  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <div className="flex flex-col gap-3">
        <Path path={`/submission/${id}`} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-2xl font-semibold">Submission #{submission.id}</h1>
          {submission.hidden && <Badge variant="secondary">Hidden</Badge>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:ml-auto">
            <VerdictCell
              submissionId={submission.id}
              testcases={submission.problem.testcases}
            />
            <ScoreCell
              submissionId={submission.id}
              problemScore={submission.problem.score}
              testcases={submission.problem.testcases}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <ProblemLink problem={submission.problem} />
          {" · "}
          <UserLink user={submission.user} />
          {" · "}
          <RelativeTime date={submission.createdAt.toISOString()} />
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/problem/${problemId}`}>
              <FileText className="h-4 w-4" />
              View problem
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/problem/${problemId}`}>
              <Send className="h-4 w-4" />
              {/* "Again" only for the submitter; anyone else is trying it. */}
              {user?.id === submission.userId ? "Submit again" : "Submit"}
            </Link>
          </Button>
          <CopyPageLinkButton />
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <aside className="flex min-w-0 flex-col gap-6 lg:order-2">
          <section>
            <h2 className="mb-2 text-lg font-semibold">Summary</h2>
            <dl className="divide-y rounded-md border text-sm">
              {summary.map(({ key, label, value }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 px-3 py-2"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="flex items-baseline gap-1.5 text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
        <div className="flex min-w-0 flex-col gap-6 lg:order-1">
          {tests}
          <section>
            <h2 className="mb-2 text-lg font-semibold">Code</h2>
            {code}
          </section>
        </div>
      </div>
    </div>
  );
}

function Limit({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

const MAX_TIME = "The maximum time taken by any testcase.";
const MAX_MEMORY = "The maximum memory used by any testcase.";

// A label with an ⓘ that explains it, as in the submission table's headers.
function InfoLabel({
  info,
  children,
}: {
  info: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center gap-1">
        {children}
        <Info className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{info}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// The problem and the user under a submission's title, each with its icon so
// the two can't be told apart only by position. The icon is part of the link;
// only the name is underlined.
function ProblemLink({ problem }: { problem: { id: number; title: string } }) {
  return (
    <Link
      href={`/problem/${problem.id}`}
      className="inline-flex items-center gap-1 align-bottom"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="link-underlined">{problem.title}</span>
    </Link>
  );
}

function UserLink({ user }: { user: { id: number; displayName: string } }) {
  return (
    <Link
      href={`/user/${user.id}/profile`}
      className="inline-flex items-center gap-1 align-bottom"
    >
      <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="link-underlined">{user.displayName}</span>
    </Link>
  );
}
