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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Path } from "@/components/path";
import { Verdict } from "./verdict";
import { SubmissionModal } from "./modal";
import { LocalTime } from "@/components/local-time";
import { ScoreCell } from "@/components/submission/score-cell";
import { TimeCell } from "@/components/submission/time-cell";
import { MemoryCell } from "@/components/submission/memory-cell";
import { CodeEditor } from "@/components/code-editor";
import {
  CopyButton,
  CopyLinkButton,
  HideButton,
  RejudgeButton,
  ShareSwitch,
} from "./buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Lock, Share2 } from "lucide-react";

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
              <CopyButton code={submission.code} />
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
          <CodeEditor
            code={submission.code}
            language={submission.language}
            readOnly
          />
        </Card>
      ) : (
        <Card className="border-dashed py-0 shadow-none">
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
          <Link
            key="problem"
            href={`/problem/${submission.problem.id}/statement`}
            className="link-underlined"
          >
            {submission.problem.title}
          </Link>,
          <Link
            key="user"
            href={`/user/${submission.user.id}/profile`}
            className="link-underlined"
          >
            {submission.user.displayName}
          </Link>,
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

  const result: any = submission.result || {};
  let maxTime = 0;
  if (result && result.times) {
    const times = (result.times as number[][]).flat();
    maxTime = times.length ? Math.max(...times) : 0;
  }
  const isTimeLimitExceeded = maxTime >= submission.problem.timeLimit;

  let maxMemory = 0;
  if (result && result.memories) {
    const memories = (result.memories as number[][]).flat();
    maxMemory = memories.length ? Math.max(...memories) : 0;
  }
  const isMemoryLimitExceeded =
    maxMemory >= submission.problem.memoryLimit * 1024;

  const data = [
    {
      label: "Problem",
      value: (
        <Link
          href={`/problem/${submission.problem.id}/statement`}
          className="link"
        >
          {submission.problem.title}
        </Link>
      ),
    },
    {
      label: "User",
      value: (
        <Link href={`/user/${submission.user.id}/profile`} className="link">
          {submission.user.displayName}
        </Link>
      ),
    },
    {
      label: "Submission Time",
      value: <LocalTime date={submission.createdAt.toISOString()} />,
    },
    {
      label: "Language",
      value: language,
    },
    {
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
      label: (
        <Tooltip>
          <TooltipTrigger className="flex items-center space-x-1 text-nowrap">
            <span>Execution Time</span>
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>The maximum time taken by any testcase.</p>
          </TooltipContent>
        </Tooltip>
      ),
      value: (
        <TimeCell
          submissionId={submission.id}
          timeLimit={submission.problem.timeLimit}
        />
      ),
    },
    {
      label: (
        <Tooltip>
          <TooltipTrigger className="flex items-center space-x-1 text-nowrap">
            <span>Memory Used</span>
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p>The maximum memory used by any testcase.</p>
          </TooltipContent>
        </Tooltip>
      ),
      value: (
        <MemoryCell
          submissionId={submission.id}
          memoryLimit={submission.problem.memoryLimit}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-xl md:max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Submission {submission.id}</span>
            {submission.hidden && <Badge variant="secondary">Hidden</Badge>}
          </CardTitle>
          <Path path={`/submission/${id}`} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Table>
              <TableBody>
                {data.map(({ label, value }, key) => (
                  <TableRow key={key}>
                    <TableCell className="text-muted-foreground">
                      {label}
                    </TableCell>
                    <TableCell>
                      <pre>{value}</pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Verdict
              submissionId={submission.id}
              testcases={submission.problem.testcases}
              problemScore={submission.problem.score}
            />
            {code}
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
