import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

import { AnnouncementEditor } from "@/components/announcement/editor";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LocalTime } from "@/components/local-time";

export const metadata: Metadata = {
  title: "Announcements",
};

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();

  if (isNaN(Number(params.id))) {
    return notFound();
  }

  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(params.id) },
    include: {
      author: true,
    },
  });
  if (!announcement) {
    return notFound();
  }

  if (announcement.visibility === "private" && user?.role !== "admin") {
    return notFound();
  }

  return (
    <div className="container mx-auto flex justify-center py-10">
      <Card className="w-full max-w-xl md:max-w-3xl">
        <CardHeader>
          <CardTitle>
            {announcement.title}
          </CardTitle>
          <CardDescription>
            By <Link href={`/user/${announcement.author.id}/profile`} className="link font-bold">{announcement.author.displayName}</Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="select-auto">
          <AnnouncementEditor
            content={announcement.content}
            readOnly
          />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Updated: <LocalTime date={announcement.updatedAt.toISOString()} />
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
