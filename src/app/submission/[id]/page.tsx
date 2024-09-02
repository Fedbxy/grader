import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { maps } from "@/config/messages";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Path } from "@/components/path";
import { Progress } from "@/components/ui/progress";

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
    Score: <div className="flex flex-col"><span className="text-xs">{submission.score * submission.problem.score / submission.problem.testcases} pts.</span><Progress className="h-2 w-32" value={submission.score * 100 / submission.problem.testcases} /></div>,
    Problem: <a href={`/api/problem/${submission.problem.id}/statement`} target="_blank" className="hover:underline">{submission.problem.title}</a>,
    User: <Link href={`/user/${submission.user.id}/profile`} className="hover:underline">{submission.user.displayName}</Link>,
    Date: new Date(submission.createdAt).toLocaleString(),
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
            {submission.verdict.length === 1 && !((submission.verdict[0] as keyof typeof maps.submission.verdict) in maps.submission.verdict) ? (
              <div className="rounded-md p-4 bg-secondary">
                {submission.verdict[0]}
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {submission.verdict.map((v, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className={`rounded-md px-4 text-xs ${v === "AC" ? "bg-constructive text-constructive-foreground" : "bg-destructive text-destructive-foreground"}`}
                  >
                    <AccordionTrigger>
                      #{i + 1} {maps.submission.verdict[v as keyof typeof maps.submission.verdict]}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table className="text-xs">
                        <TableBody>
                          {submission.error && (
                            <TableRow>
                              <TableCell>Error</TableCell>
                              <TableCell><pre>{submission.error}</pre></TableCell>
                            </TableRow>
                          )}
                          <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>{submission.time[i]}ms</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Memory</TableCell>
                            <TableCell>{submission.memory[i]}KB</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <div className="rounded-md p-4 overflow-x-auto bg-secondary">
              <pre>{submission.code}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}