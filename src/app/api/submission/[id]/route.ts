import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { canViewSubmission } from "@/utils/submission";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            statusCode: 400,
            method: request.method,
            message: "Invalid submission ID",
            error: "Bad Request",
        }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
        where: { id: Number(params.id) },
        select: {
            id: true,
            score: true,
            result: true,
            status: true,
            errorCode: true,
            error: true,
            userId: true,
            hidden: true,
            problem: { select: { visibility: true } },
        },
    })
    const { user } = await validateRequest();
    if (!submission || !canViewSubmission(user, submission)) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET submission ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    const { problem, userId, hidden, ...body } = submission;
    return NextResponse.json(body);
}