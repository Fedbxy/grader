import { allowAccess } from "@/utils/access";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Path } from "@/components/path";
import { Button } from "@/components/ui/button";
import { LocalTime } from "@/components/local-time";

export default async function Page({ params }: { params: { id: string } }) {
    await allowAccess("admin");

    if (isNaN(Number(params.id))) {
        notFound();
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) }
    })

    if (!user) {
        notFound();
    }

    const data = {
        "ID": user.id,
        "Username": user.username,
        "Display Name": user.displayName,
        "Bio": user.bio || "",
        "Role": user.role,
        "Banned": user.isBanned ? <span className="text-destructive">Yes</span> : "No",
        "Created": <LocalTime date={user.createdAt.toISOString()} />,
        "Updated": <LocalTime date={user.updatedAt.toISOString()} />,
    };

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-lg md:max-w-xl">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <Path path={`/dashboard/user/${user.id}`} />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={user.avatar ? `/api/user/${user.id}/avatar` : ""} alt={user.username} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
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
                        <Link href={`/dashboard/user/${user.id}/edit`}>Edit</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}