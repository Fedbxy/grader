import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { profileUserSelect, submissionListSelect } from "@/lib/select";
import { getProfileStats } from "@/utils/accepted";
import { visibleSubmissionsWhere } from "@/utils/submission";
import { BadgeCheck, Ban, CalendarDays, CircleCheck } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SubmissionTable } from "@/components/submission/table";
import { RelativeTime } from "@/components/relative-time";

export const metadata: Metadata = {
    title: "User Profile",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (isNaN(Number(params.id))) {
        notFound();
    }

    const id = Number(params.id);
    const [{ user: viewer }, user] = await Promise.all([
        validateRequest(),
        prisma.user.findUnique({ where: { id }, select: profileUserSelect }),
    ]);

    if (!user) {
        notFound();
    }

    // Everything below follows what the viewer may see: hidden submissions only
    // for their owner and admins, private problems only for admins.
    const [stats, recent] = await Promise.all([
        getProfileStats(user.id, viewer),
        prisma.submission.findMany({
            where: { userId: user.id, ...visibleSubmissionsWhere(viewer) },
            orderBy: { id: "desc" },
            take: 50,
            select: submissionListSelect,
        }),
    ]);
    const tiles = [
        { label: "Solved", value: stats.solved.length },
        { label: "Attempted", value: stats.attempted },
        { label: "Submissions", value: stats.submissions },
    ];

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-4xl">
                <CardHeader />
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={user.avatar ? `/api/user/${user.id}/avatar` : ""} alt={user.username} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center space-x-2">
                                {user.role === "admin" && <Badge><BadgeCheck className="h-4 w-4 mr-1" />{user.role}</Badge>}
                                {user.isBanned && <Badge variant="destructive"><Ban className="h-4 w-4 mr-1" />Banned</Badge>}
                            </div>
                            <p className="text-lg font-semibold">{user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{user.username}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Joined <RelativeTime date={user.createdAt.toISOString()} />
                            </p>
                        </div>
                        {/* Prose in the normal font, keeping the bio's own line breaks; no
                            box at all when there's nothing to say. */}
                        {user.bio?.trim() && (
                            <p className="rounded-md bg-secondary p-4 text-sm whitespace-pre-line break-words">{user.bio}</p>
                        )}
                        {/* One strip with dividers rather than three boxes: no gaps or
                            double padding, so "Submissions" fits on a phone. */}
                        <div className="grid grid-cols-3 divide-x rounded-md border">
                            {tiles.map((tile) => (
                                <div key={tile.label} className="px-1 py-3 text-center">
                                    <p className="text-2xl font-semibold tabular-nums">{tile.value}</p>
                                    <p className="text-xs text-muted-foreground">{tile.label}</p>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <section className="space-y-2">
                            <h2 className="flex items-baseline gap-2 text-lg font-semibold">
                                Solved problems
                                <span className="text-sm font-normal text-muted-foreground tabular-nums">{stats.solved.length}</span>
                            </h2>
                            {stats.solved.length > 0 ? (
                                <ul className="flex flex-wrap gap-2 text-sm">
                                    {stats.solved.map((problem) => (
                                        <li key={problem.id}>
                                            <Link
                                                href={`/problem/${problem.id}/statement`}
                                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                                            >
                                                <CircleCheck className="h-4 w-4 text-constructive dark:text-green-400" />
                                                <span className="text-muted-foreground tabular-nums">#{problem.id}</span>
                                                <span className="font-medium">{problem.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No problems solved yet.</p>
                            )}
                        </section>
                        <Separator />
                        <section className="space-y-2">
                            <h2 className="text-lg font-semibold">Recent submissions</h2>
                            <SubmissionTable data={recent} columnVisibility={{ user: false }} />
                        </section>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}