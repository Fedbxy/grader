import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { adminUserSelect } from "@/lib/select";
import { notFound } from "next/navigation";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditUserForm } from "./form";
import { Path } from "@/components/path";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        select: adminUserSelect,
    })

    if (!user) {
        notFound();
    }

    return (
        <div className="container flex flex-col items-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Edit User</CardTitle>
                    <Path path={`/dashboard/user/${user.id}/edit`} />
                </CardHeader>
                <CardContent>
                    <EditUserForm user={user} />
                </CardContent>
            </Card>
        </div>
    );
}