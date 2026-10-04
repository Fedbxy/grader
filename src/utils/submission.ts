import type { Prisma } from "@prisma/client";
import type { Role } from "@/types/user";

// Who is looking: a signed-in user (id and role) or null for a visitor.
type Viewer = { id: number; role: Role } | null;

// Whether the viewer may open a submission page or poll its result (private problems: admins only).
export function canViewSubmission(
    viewer: Viewer,
    submission: { problem: { visibility: string } },
): boolean {
    return submission.problem.visibility === "public" || viewer?.role === "admin";
}

// Whether the viewer may read a submission's code (only its submitter and admins).
export function canViewCode(viewer: Viewer, submission: { userId: number }): boolean {
    return viewer !== null && (viewer.role === "admin" || viewer.id === submission.userId);
}

// The `where` fragment for submission lists: only the submissions the viewer may open.
export function visibleSubmissionsWhere(viewer: Viewer): Prisma.SubmissionWhereInput {
    return viewer?.role === "admin" ? {} : { problem: { visibility: "public" } };
}
