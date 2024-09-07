import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditUserForm } from "./form";
import { Path } from "@/components/path";

export default async function Page({ params }: { params: { id: string } }) {
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
    })

    if (!user) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Edit User Details</CardTitle>
                    <Path path={`/dashboard/user/${user.id}/edit`} />
                </CardHeader>
                <CardContent>
                    <EditUserForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}