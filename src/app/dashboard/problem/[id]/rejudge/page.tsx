import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Path } from "@/components/path";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfirmButton } from "./confirmButton";

export default async function Page({ params }: { params: { id: string } }) {
  await allowAccess("admin");

  if (isNaN(Number(params.id))) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: { id: Number(params.id) },
  });
  if (!problem) {
    notFound();
  }

  const submissions = await prisma.submission.count({
    where: { problemId: problem.id },
  });
  const submission = await prisma.submission.findMany({
    where: { problemId: problem.id },
    select: { id: true },
  });
  const submissionIds = submission.map((submission) => submission.id);

  const data = {
    ID: problem.id,
    Title: problem.title,
    Visibility: problem.visibility === "public" ? "Public" : "Private",
    Limits: `${problem.timeLimit}ms | ${problem.memoryLimit}MB`,
    Submissions: submissions,
  };

  return (
    <div className="container flex flex-col items-center">
      <Card className="w-full max-w-lg md:max-w-xl">
        <CardHeader>
          <CardTitle className="text-destructive">
            Rejudge All Submissions
          </CardTitle>
          <Path path={`/dashboard/problem/${params.id}/rejudge`} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {Object.entries(data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="text-muted-foreground">{key}</TableCell>
                  <TableCell>
                    <pre>{value}</pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Rejudge</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will rejudge all
                  submissions for this problem.{" "}
                  <span className="font-bold">
                    It will take a lot of server resources and time. Please use
                    this feature with caution.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <ConfirmButton
                  problemId={problem.id}
                  submissionIds={submissionIds}
                />
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
