import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { getProblemData } from "@/utils/problem";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProblemTabs } from "./tabs";

export default async function DashboardLayout({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem } = await getProblemData(Number(params.id));

  return (
    <div className="flex flex-col space-y-4 px-4 py-4 md:space-y-8 md:px-32 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{problem.title}</span>
            <a href={`/api/problem/${problem.id}/statement`} target="_blank">
              <Button variant="link">[ Download ]</Button>
            </a>
          </CardTitle>
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
        <CardContent>
          <ProblemTabs problemId={problem.id} />
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
