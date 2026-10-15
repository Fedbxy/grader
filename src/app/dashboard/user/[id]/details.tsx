import Link from "next/link";
import prisma from "@/lib/prisma";
import { maps } from "@/config/messages";
import { getAdminProfileStats } from "@/utils/accepted";
import { submissionVerdict } from "@/utils/verdict";
import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LocalTime } from "@/components/local-time";
import { Path } from "@/components/path";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

const DAY = 24 * 60 * 60 * 1000;

type VerdictCode = keyof typeof maps.submission.verdict;

// Everything the section shows, counted with hidden submissions included. A
// plain function rather than inline in the component because it reads the clock.
async function loadAdminData(userId: number) {
    const now = Date.now();
    const [stats, extra, latestSession, activeSessions, last7, last30, submissions, problemCount, announcementCount] =
        await Promise.all([
            getAdminProfileStats(userId),
            prisma.user.findUnique({ where: { id: userId }, select: { updatedAt: true } }),
            prisma.session.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
            prisma.session.count({ where: { userId, expiresAt: { gt: new Date(now) } } }),
            prisma.submission.count({ where: { userId, createdAt: { gte: new Date(now - 7 * DAY) } } }),
            prisma.submission.count({ where: { userId, createdAt: { gte: new Date(now - 30 * DAY) } } }),
            prisma.submission.findMany({
                where: { userId },
                select: { errorCode: true, status: true, score: true, result: true, problem: { select: { testcases: true } } },
            }),
            prisma.problem.count({ where: { authorId: userId } }),
            prisma.announcement.count({ where: { authorId: userId } }),
        ]);
    return { stats, extra, latestSession, activeSessions, last7, last30, submissions, problemCount, announcementCount };
}

// What an admin sees about a user on the dashboard: the public profile's
// numbers split by problem visibility, the account, activity, and the actions.
// Only the admin page renders it, so these queries never run for anyone else.
export async function UserAdminDetails({
    user,
    viewerId,
}: {
    user: {
        id: number;
        username: string;
        avatar: string | null;
        displayName: string;
        bio: string | null;
        role: string;
        isBanned: boolean;
        createdAt: Date;
    };
    viewerId?: number;
}) {
    const { stats, extra, latestSession, activeSessions, last7, last30, submissions, problemCount, announcementCount } =
        await loadAdminData(user.id);

    // Verdict counts over all their submissions, biggest first, then by name.
    const counts = new Map<string, number>();
    for (const submission of submissions) {
        const { code } = submissionVerdict(
            { ...submission, result: submission.result as { verdicts?: string[][] } | null },
            submission.problem.testcases,
        );
        const label = code === "running" ? "Judging" : (maps.submission.verdict[code as VerdictCode] ?? code);
        counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const verdicts = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const rows = [
        { label: "Public", ...stats.public },
        { label: "Private", ...stats.private },
        { label: "All", ...stats.all },
    ];
    const details = [
        { label: "ID", value: user.id },
        { label: "Username", value: user.username },
        { label: "Display name", value: user.displayName },
        { label: "Role", value: user.role },
        {
            label: "Status",
            value: user.isBanned ? <Badge variant="destructive">Banned</Badge> : "Active",
        },
        { label: "Joined", value: <LocalTime date={user.createdAt.toISOString()} /> },
        { label: "Profile updated", value: extra && <LocalTime date={extra.updatedAt.toISOString()} /> },
        // Sessions are deleted on sign-out, so this is the newest one still
        // stored, not necessarily the last sign-in.
        { label: "Latest session started", value: latestSession ? <LocalTime date={latestSession.createdAt.toISOString()} /> : "None" },
        { label: "Active sessions", value: activeSessions },
    ];
    const activity = [
        { label: "Last 7 days", value: last7 },
        { label: "Last 30 days", value: last30 },
    ];

    // No card around the page, like the submission page: a header with the
    // actions, the numbers in the wide column and the account beside them.
    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-4">
                <Path path={`/dashboard/user/${user.id}`} />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-16 w-16 shrink-0">
                        <AvatarImage src={user.avatar ? `/api/user/${user.id}/avatar` : ""} alt={user.username} />
                        <AvatarFallback className="text-xl">{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold">
                            {user.displayName}
                            {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                        </h1>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                    </div>
                    {/* Editing and banning are the dashboard's own pages, with their
                        own confirm step; the ban page can't ban yourself, so no
                        button then. */}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/user/${user.id}/profile`}>
                                <UserRound className="h-4 w-4" />
                                View profile
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/user/${user.id}/edit`}>Edit user</Link>
                        </Button>
                        {user.id !== viewerId && (
                            <Button variant="destructive" size="sm" asChild>
                                <Link href={`/dashboard/user/${user.id}/ban`}>{user.isBanned ? "Unban" : "Ban"}</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                <aside className="flex min-w-0 flex-col gap-2 lg:order-2">
                    <h2 className="text-lg font-semibold">Account</h2>
                    <dl className="divide-y rounded-md border text-sm">
                        {details.map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between gap-4 px-3 py-2">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="whitespace-nowrap text-right">{value}</dd>
                            </div>
                        ))}
                        {/* Below the rest, on its own rows: a bio can run to several lines. */}
                        <div className="flex flex-col gap-1 px-3 py-2">
                            <dt className="text-muted-foreground">Bio</dt>
                            <dd className="whitespace-pre-line break-words">
                                {user.bio?.trim() || <span className="text-muted-foreground">None</span>}
                            </dd>
                        </div>
                    </dl>
                </aside>

                <div className="flex min-w-0 flex-col gap-6 lg:order-1">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Stats by problem visibility</h2>
                        <div className="overflow-hidden rounded-md border">
                            {/* Smaller headers on a phone, so all four columns fit. */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead />
                                        <TableHead className="text-right text-xs sm:text-sm">Solved</TableHead>
                                        <TableHead className="text-right text-xs sm:text-sm">Attempted</TableHead>
                                        <TableHead className="text-right text-xs sm:text-sm">Submissions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="tabular-nums">
                                    {rows.map((row) => (
                                        <TableRow key={row.label} className={row.label === "All" ? "font-medium" : ""}>
                                            <TableCell>{row.label}</TableCell>
                                            <TableCell className="text-right">{row.solved}</TableCell>
                                            <TableCell className="text-right">{row.attempted}</TableCell>
                                            <TableCell className="text-right">{row.submissions}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-sm text-muted-foreground">Hidden submissions: <span className="tabular-nums">{stats.hidden}</span></p>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Activity</h2>
                        <dl className="divide-y rounded-md border text-sm">
                            {activity.map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between gap-4 px-3 py-2">
                                    <dt className="text-muted-foreground">Submissions, {label.toLowerCase()}</dt>
                                    <dd className="tabular-nums">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        {verdicts.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                                {verdicts.map(([label, count]) => (
                                    <li key={label}>
                                        <Badge variant="outline" className="gap-1.5">
                                            {label}
                                            <span className="tabular-nums text-muted-foreground">{count}</span>
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No submissions yet.</p>
                        )}
                        {/* The dashboard lists can't filter by author, so these open the whole list. */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <Link href="/dashboard/problem" className="link-underlined">Problems authored ({problemCount})</Link>
                            <Link href="/dashboard/announcement" className="link-underlined">Announcements ({announcementCount})</Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
