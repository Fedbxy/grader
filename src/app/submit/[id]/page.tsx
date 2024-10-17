import { validateRequest } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitForm } from "./form";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    redirect(`/signin?nextUrl=${`/submit/${params.id}`}`);
  }

  if (isNaN(Number(params.id))) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: {
      id: Number(params.id),
    },
    include: {
      author: true,
      UserProblem: {
        where: {
          userId: user.id,
        },
        include: {
          submission: true,
        },
      },
    },
  });
  if (!problem || (user.role !== "admin" && problem.visibility === "private")) {
    notFound();
  }

  const submission = problem.UserProblem[0]?.submission;
  const latestCode = submission ? submission.code : "";
  const latestLanguage = submission ? submission.language : undefined;

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-xl md:max-w-3xl">
        <CardHeader>
          <CardTitle>
            Submit{" "}
            <a
              href={`/api/problem/${problem.id}/statement`}
              target="_blank"
              className="hover:underline"
            >
              {problem.title}
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubmitForm
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
            problemId={Number(params.id)}
            userId={user.id}
            latestCode={latestCode}
            latestLanguage={latestLanguage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
