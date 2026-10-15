import { allowAccess } from "@/utils/access";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

import { UserAdminDetails } from "./details";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await allowAccess("admin");
    const { user: viewer } = await validateRequest();

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
            isBanned: true,
            createdAt: true,
        },
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="container mx-auto py-4">
            <UserAdminDetails user={user} viewerId={viewer?.id} />
        </div>
    );
}
