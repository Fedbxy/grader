import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { publicUserSelect } from "@/lib/select";
import { notFound } from "next/navigation";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EditProblemForm } from "./form";
import { Path } from "@/components/path";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const problemData = await prisma.problem.findUnique({
        where: { id: Number(params.id) },
        include: { author: { select: publicUserSelect } },
    });
    if (!problemData) {
        notFound();
    }

    const problem = { ...problemData, statement: null };

    return (
        <div className="container flex flex-col items-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Edit Problem</CardTitle>
                    <Path path={`/dashboard/problem/${params.id}/edit`} />
                </CardHeader>
                <CardContent>
                    <EditProblemForm problem={problem} />
                </CardContent>
            </Card>
        </div>
    );
}