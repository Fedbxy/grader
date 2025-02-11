import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFile } from "@/lib/minio";

import { FileText } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Path } from "@/components/path";
import { LocalTime } from "@/components/local-time";

export default async function Page({ params }: { params: { id: string } }) {
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const problem = await prisma.problem.findUnique({
        where: { id: Number(params.id) },
        include: {
            author: true,
        },
    })
    if (!problem) {
        notFound();
    }

    const statement = await getFile(`problem/${params.id}/statement.pdf`) as Buffer || null;

    const data = {
        "ID": problem.id,
        "Title": problem.title,
        "Statement": statement ? <a href={`/api/problem/${params.id}/statement`} target="_blank" className="link flex items-center"><FileText className="h-4 w-4 mr-1" />View</a> : <span className="text-muted-foreground">Not uploaded</span>,
        "Visibility": problem.visibility === "public" ? "Public" : <span className="text-muted-foreground">Private</span>,
        "Time Limit": `${problem.timeLimit}ms`,
        "Memory Limit": `${problem.memoryLimit}MB`,
        "Score": problem.score,
        "Testcases": problem.testcases,
        "Author": <Link href={`/dashboard/user/${problem.author.id}`} className="link">{problem.author.displayName}</Link>,
        "Created": <LocalTime date={problem.createdAt.toISOString()} />,
        "Updated": <LocalTime date={problem.updatedAt.toISOString()} />,
    };

    return (
        <div className="container flex flex-col items-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>Problem Details</CardTitle>
                    <Path path={`/dashboard/problem/${params.id}`} />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <Table>
                            <TableCaption className="text-left">This is read-only data.</TableCaption>
                            <TableBody>
                                {Object.entries(data).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="text-muted-foreground">{key}</TableCell>
                                        <TableCell><pre>{value}</pre></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="link" asChild>
                        <Link href={`/dashboard/problem/${problem.id}/edit`}>Edit</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}