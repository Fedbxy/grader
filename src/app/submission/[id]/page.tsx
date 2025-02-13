import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Path } from "@/components/path";
import { Verdict } from "./verdict";
import { LocalTime } from "@/components/local-time";
import { Score } from "./score";
import { CodeEditor } from "@/components/code-editor";
import { CopyButton } from "./copy";

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

  const data = {
    Score: (
      <Score
        submissionId={submission.id}
        problemScore={submission.problem.score}
        testcases={submission.problem.testcases}
      />
    ),
    Problem: (
      <a
        href={`/api/problem/${submission.problem.id}/statement`}
        target="_blank"
        className="link"
      >
        {submission.problem.title}
      </a>
    ),
    User: (
      <Link href={`/user/${submission.user.id}/profile`} className="link">
        {submission.user.displayName}
      </Link>
    ),
    "Submission Time": <LocalTime date={submission.createdAt.toISOString()} />,
    Language: submission.language,
  };

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
                {Object.entries(data).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="text-muted-foreground">
                      {key}
                    </TableCell>
                    <TableCell>
                      <pre>{value}</pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Card className="relative overflow-hidden">
              <div className="absolute right-2 top-2 z-20">
                <CopyButton code={submission.code} />
              </div>
              <CodeEditor
                code={submission.code}
                language={submission.language}
                readOnly
              />
            </Card>
            <Card>
              <Verdict submissionId={submission.id} />
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
