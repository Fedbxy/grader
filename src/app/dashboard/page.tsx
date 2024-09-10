import { allowAccess } from "@/utils/access";
import Link from "next/link";
import { Users, FileText, FileCheck2 } from "lucide-react";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationTabs } from "./tabs";

export default async function Page() {
  await allowAccess("admin");

  const users = await prisma.user.count();
  const problems = await prisma.problem.count();
  const submissions = await prisma.submission.count();

  const timestamp = new Date().toLocaleString();

  return (
    <div className="container mx-auto flex flex-col space-y-2 py-10">
      <NavigationTabs page="dashboard" />
      <div className="flex flex-col justify-center gap-8 py-8 md:flex-row">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-4xl font-bold">{users}</div>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
              <Link href="/dashboard/user">
                <Button variant="outline" size="sm">
                  View Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Problems
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-4xl font-bold">{problems}</div>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
              <Link href="/dashboard/problem">
                <Button variant="outline" size="sm">
                  View Problems
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-4xl font-bold">{submissions}</div>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
              <Link href="/dashboard/submission">
                <Button variant="outline" size="sm">
                  View Submissions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
