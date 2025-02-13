import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { validateRequest } from "@/lib/auth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Path } from "@/components/path";
import { Verdict } from "./verdict";
import { LocalTime } from "@/components/local-time";
import { Score } from "./score";
import { CodeEditor } from "@/components/code-editor";
import { CopyButton, RejudgeButton } from "./buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default async function Page({ params }: { params: { id: string } }) {
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const submission = await prisma.submission.findUnique({
    where: { id: Number(params.id) },
    include: {
      problem: true,
      user: true,
    },
  });
  if (!submission) {
    notFound();
  }

  const { user } = await validateRequest();

  const maxTime = Math.max(...submission.time);
  const isTimeLimitExceeded = maxTime >= submission.problem.timeLimit;

  const maxMemory = Math.max(...submission.memory);
  const isMemoryLimitExceeded =
    maxMemory >= submission.problem.memoryLimit * 1024;

  const data = [
    {
      label: "Problem",
      value: (
        <a
          href={`/api/problem/${submission.problem.id}/statement`}
          target="_blank"
          className="link"
        >
          {submission.problem.title}
        </a>
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
      value: submission.language,
    },
    {
      label: "Score",
      value: (
        <Score
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
        <span className={isTimeLimitExceeded ? "text-destructive" : ""}>
          {maxTime} ms
        </span>
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
        <span className={isMemoryLimitExceeded ? "text-destructive" : ""}>
          {maxMemory} MB
        </span>
      ),
    },
  ];

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-xl md:max-w-2xl">
        <CardHeader>
          <CardTitle>Submission {submission.id}</CardTitle>
          <Path path={`/submission/${params.id}`} />
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
            <Card className="overflow-hidden">
              <Verdict submissionId={submission.id} />
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute right-2 top-2 z-20 flex space-x-2">
                {user?.role === "admin" && <RejudgeButton id={submission.id} />}
                <CopyButton code={submission.code} />
              </div>
              <CodeEditor
                code={submission.code}
                language={submission.language}
                readOnly
              />
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
