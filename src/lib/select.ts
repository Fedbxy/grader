import type { Prisma } from "@prisma/client";

// Prisma `select`s for rows that end up in a page payload. Server components
// hand their query results to client components, and Next serializes every
// field of those props into the HTML. Always select explicitly here: never
// `include: { user: true }`, which ships the password hash, and never `code`
// in a list.

// A user as shown in a table or byline: a name and a link to the profile.
export const publicUserSelect = {
    id: true,
    displayName: true,
} satisfies Prisma.UserSelect;

// A submission as shown in a submission table: no code, no judge internals.
export const submissionListSelect = {
    id: true,
    hidden: true,
    problem: {
        select: {
            id: true,
            title: true,
            score: true,
            timeLimit: true,
            memoryLimit: true,
            testcases: true,
        },
    },
    user: { select: publicUserSelect },
} satisfies Prisma.SubmissionSelect;

// Every User field the admin edit form can read, and nothing else.
export const adminUserSelect = {
    id: true,
    username: true,
    role: true,
    isBanned: true,
    displayName: true,
    bio: true,
    avatar: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;
