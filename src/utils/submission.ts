import type { Prisma } from "@prisma/client";
import type { Role } from "@/types/user";

// Who is looking: a signed-in user (id and role) or null for a visitor.
type Viewer = { id: number; role: Role } | null;

// Whether the viewer may open a submission page or poll its result. Admins see
// everything. Others never see private problems, and hidden submissions only
// when they are the submitter.
export function canViewSubmission(
    viewer: Viewer,
    submission: { userId: number; hidden: boolean; problem: { visibility: string } },
): boolean {
    if (viewer?.role === "admin") {
        return true;
    }
    if (submission.problem.visibility !== "public") {
        return false;
    }
    return !submission.hidden || viewer?.id === submission.userId;
}

// Whether the viewer may read a submission's code: admins, the submitter, or
// anyone once the code is shared. Never beyond canViewSubmission, so a hidden
// submission or one on a private problem stays closed even if its code is shared.
export function canViewCode(
    viewer: Viewer,
    submission: {
        userId: number;
        hidden: boolean;
        codePublic: boolean;
        problem: { visibility: string };
    },
): boolean {
    if (!canViewSubmission(viewer, submission)) {
        return false;
    }
    return (
        submission.codePublic ||
        (viewer !== null && (viewer.role === "admin" || viewer.id === submission.userId))
    );
}

// The `where` fragment for submission lists: only the submissions the viewer may open.
export function visibleSubmissionsWhere(viewer: Viewer): Prisma.SubmissionWhereInput {
    if (viewer?.role === "admin") {
        return {};
    }
    if (!viewer) {
        return { problem: { visibility: "public" }, hidden: false };
    }
    return {
        problem: { visibility: "public" },
        OR: [{ hidden: false }, { userId: viewer.id }],
    };
}
