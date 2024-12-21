import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditAnnouncementForm } from "./form";
import { Path } from "@/components/path";

export default async function Page({ params }: { params: { id: string } }) {
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const announcement = await prisma.announcement.findUnique({
        where: { id: Number(params.id) },
        include: { author: true },
    });
    if (!announcement) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Edit Announcement Details</CardTitle>
                    <Path path={`/dashboard/announcement/${params.id}/edit`} />
                </CardHeader>
                <CardContent>
                    <EditAnnouncementForm announcement={announcement} />
                </CardContent>
            </Card>
        </div>
    );
}