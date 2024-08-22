import { allowAccess } from "@/lib/auth";
import Link from "next/link";
import { Users, FileText } from "lucide-react";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Page() {
    await allowAccess("admin");

    const users = await prisma.user.count();
    const problems = await prisma.problem.count();

    const timestamp = new Date().toLocaleString();

    return (
        <div className="flex justify-center space-x-8 py-8">
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
                    <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
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
        </div>
    );
}
