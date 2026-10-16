import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { submissionListSelect } from "@/lib/select";
import { visibleSubmissionsWhere } from "@/utils/submission";

import { SubmissionTable } from "@/components/submission/table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Submission",
};

export default async function Page() {
    const { user } = await validateRequest();

    const data = await prisma.submission.findMany({
        where: visibleSubmissionsWhere(user),
        orderBy: {
            id: "desc",
        },
        select: submissionListSelect,
    });

    return (
        <div className="container flex flex-col space-y-2 mx-auto py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">All Submissions</h1>
                {/* A plain link, not next/link: a client-side move to
                    /submission/my is caught by the submission modal's
                    intercepting route, which leaves this page on screen. */}
                {user && (
                    <Button variant="outline" size="sm" asChild>
                        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see above */}
                        <a href="/submission/my">View My Submissions</a>
                    </Button>
                )}
            </div>
            <h2 className="text-sm text-muted-foreground">Select a submission to view more details</h2>
            <SubmissionTable data={data} />
        </div>
    );
}