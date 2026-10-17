import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { profileUserSelect, submissionListSelect } from "@/lib/select";
import { getProfileStats } from "@/utils/accepted";
import { visibleSubmissionsWhere } from "@/utils/submission";
import { BadgeCheck, Ban, CalendarDays, CircleCheck, ShieldCheck } from "lucide-react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

    // No card around the page, as on the submission page: a header, the
    // numbers, the solved problems, then the recent submissions at full width,
    // since the table needs it.
    return (
        <div className="container mx-auto flex flex-col gap-6 py-10">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 shrink-0">
                    <AvatarImage src={user.avatar ? `/api/user/${user.id}/avatar` : ""} alt={user.username} />
                    <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
                        {user.role === "admin" && <Badge><BadgeCheck className="mr-1 h-4 w-4" />{user.role}</Badge>}
                        {user.isBanned && <Badge variant="destructive"><Ban className="mr-1 h-4 w-4" />Banned</Badge>}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
                        {user.username}
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Joined <RelativeTime date={user.createdAt.toISOString()} />
                        </span>
                    </p>
                    {/* Prose in the normal font, keeping the bio's own line breaks;
                        nothing at all when there's nothing to say. */}
                    {user.bio?.trim() && (
                        <p className="mt-2 max-w-prose text-sm whitespace-pre-line break-words">{user.bio}</p>
                    )}
                </div>
                {/* The profile is the same for everyone; admin details live in
                    the dashboard. */}
                {viewer?.role === "admin" && (
                    <Button variant="outline" size="sm" className="self-start" asChild>
                        <Link href={`/dashboard/user/${user.id}`}>
                            <ShieldCheck className="h-4 w-4" />
                            Manage user
                        </Link>
                    </Button>
                )}
            </header>
            {/* One strip with dividers rather than three boxes: no gaps or
                double padding, so "Submissions" fits on a phone. */}
            <div className="grid grid-cols-3 divide-x rounded-md border sm:max-w-md">
                {tiles.map((tile) => (
                    <div key={tile.label} className="px-1 py-3 text-center">
                        <p className="text-2xl font-semibold tabular-nums">{tile.value}</p>
                        <p className="text-xs text-muted-foreground">{tile.label}</p>
                    </div>
                ))}
            </div>
            <section className="flex min-w-0 flex-col gap-2">
                <h2 className="flex items-baseline gap-2 text-lg font-semibold">
                    Solved problems
                    <span className="text-sm font-normal text-muted-foreground tabular-nums">{stats.solved.length}</span>
                </h2>
                {stats.solved.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 text-sm">
                        {stats.solved.map((problem) => (
                            <li key={problem.id} className="min-w-0 max-w-full">
                                <Link
                                    href={`/problem/${problem.id}`}
                                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                                >
                                    <CircleCheck className="h-4 w-4 shrink-0 text-constructive dark:text-green-400" />
                                    <span className="text-muted-foreground tabular-nums">#{problem.id}</span>
                                    <span className="truncate font-medium">{problem.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No problems solved yet.</p>
                )}
            </section>
            <section className="flex min-w-0 flex-col gap-2">
                <h2 className="text-lg font-semibold">Recent submissions</h2>
                <SubmissionTable data={recent} columnVisibility={{ user: false }} />
            </section>
        </div>
    );
}
