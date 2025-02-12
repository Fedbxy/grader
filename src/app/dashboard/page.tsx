import { allowAccess } from "@/utils/access";
import Link from "next/link";
import { Users, FileText, FileCheck2 } from "lucide-react";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocalTime } from "@/components/local-time";

export default async function Page() {
  await allowAccess("admin");

  const announcements = await prisma.announcement.count();
  const users = await prisma.user.count();
  const problems = await prisma.problem.count();
  const submissions = await prisma.submission.count();

  const timestamp = <LocalTime date={new Date().toISOString()} />;

  const stats = [
    {
      title: "Announcements",
      count: announcements,
      icon: FileText,
      href: "/dashboard/announcement",
    },
    {
      title: "Users",
      count: users,
      icon: Users,
      href: "/dashboard/user",
    },
    {
      title: "Problems",
      count: problems,
      icon: FileCheck2,
      href: "/dashboard/problem",
    },
    {
      title: "Submissions",
      count: submissions,
      icon: FileText,
      href: "/dashboard/submission",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <div className="text-4xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">{timestamp}</p>
                <Link href={stat.href}>
                  <Button variant="outline" size="sm">
                    View {stat.title}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
