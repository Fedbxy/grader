import { validateRequest } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubmitForm } from "./form";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/signin");
  }

  if (isNaN(Number(params.id))) {
    notFound();
  }

  const problem = await prisma.problem.findUnique({
    where: { id: Number(params.id) },
    include: { author: true },
  });
  if (!problem || (user.role !== "admin" && problem.visibility === "private")) {
    notFound();
  }

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-lg md:max-w-xl">
        <CardHeader>
          <CardTitle>
            Submit <a href={`/api/problem/${problem.id}/statement`} target="_blank" className="hover:underline">{problem.title}</a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubmitForm problemId={Number(params.id)} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
