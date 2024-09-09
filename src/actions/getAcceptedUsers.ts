"use server";

import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";

export async function getAcceptedUsers(problemId: number) {
    const data = await prisma.problem.findUnique({
        where: {
            id: problemId,
        },
        select: {
            title: true,
            UserProblem: {
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                        },
                    },
                },
            },
        },
    });
    if (!data) {
        return {
            error: messages.database.noProblem,
        };
    }

    const acceptedUsers = data.UserProblem.filter((userProblem) => userProblem.isAccepted).map((userProblem) => userProblem.user);

    return {
        title: data.title,
        acceptedUsers,
    };
}