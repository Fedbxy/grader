import { validateRequest } from "@/lib/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SplitEditor } from "./split-editor";
import { SubmitForm } from "./form";
import { Statement } from "./statement";
import { SquareSplitHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (isNaN(Number(params.id))) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(params.id),
    },
    include: {
      author: true,
    },
  });
  if (
    !problem ||
    (user?.role !== "admin" && problem.visibility === "private")
  ) {
    notFound();
  }

  let submission;
  if (user) {
    const UserProblem = await prisma.userProblem.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      include: {
        submission: {
          select: {
            code: true,
            language: true,
          },
        },
      },
    });

    submission = UserProblem?.submission;
  }

  const latestCode = submission ? submission.code : "";
  const latestLanguage = submission ? submission.language : undefined;

  return (
    <Tabs defaultValue="statement" className="px-4 py-4 md:px-32 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle>{problem.title}</CardTitle>
          <CardDescription>
            <span>
              by{" "}
              <Link
                href={`/user/${problem.author.id}/profile`}
                className="link"
              >
                {problem.author.displayName}
              </Link>
            </span>
          </CardDescription>
          <span className="flex space-x-2">
            <Badge variant="outline">
              {problem.timeLimit / 1000}{" "}
              {problem.timeLimit === 1000 ? "second" : "seconds"}
            </Badge>
            <Badge variant="outline">{problem.memoryLimit} MB</Badge>
          </span>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="submit">Submit</TabsTrigger>
            <TabsTrigger value="split" className="hidden md:block">
              <SquareSplitHorizontal className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>
          <a
            href={`/api/problem/${problem.id}/statement`}
            className="link"
            target="_blank"
          >
            <Button variant="link">Download</Button>
          </a>
        </CardContent>
      </Card>
      <TabsContent
        value="statement"
        className="min-h-screen-minus-header-footer"
      >
        <Statement problemId={problem.id} />
      </TabsContent>
      <TabsContent value="submit">
        <SubmitForm
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
          problemId={Number(params.id)}
          latestCode={latestCode}
          latestLanguage={latestLanguage}
          disabled={!user}
        />
      </TabsContent>
      <TabsContent value="split">
        <SplitEditor
          problemId={problem.id}
          latestCode={latestCode}
          latestLanguage={latestLanguage}
          formDisabled={!user}
        />
      </TabsContent>
    </Tabs>
  );
}
