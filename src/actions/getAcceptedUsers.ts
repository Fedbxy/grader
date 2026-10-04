"use server";

import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";
import { validateRequest } from "@/lib/auth";
import { listAcceptedUsers } from "@/utils/accepted";

export async function getAcceptedUsers(problemId: number) {
    const problem = await prisma.problem.findUnique({
        where: {
            id: problemId,
        },
        select: {
            title: true,
            visibility: true,
        },
    });
    // A private problem doesn't exist for non-admins, as on its own page.
    const { user } = await validateRequest();
    if (!problem || (problem.visibility !== "public" && user?.role !== "admin")) {
        return {
            error: messages.database.noProblem,
        };
    }

    // Distinct solvers, hidden submissions excluded (an admin testing does not count).
    const acceptedUsers = await listAcceptedUsers(problemId);

    return {
        title: problem.title,
        acceptedUsers,
    };
}
