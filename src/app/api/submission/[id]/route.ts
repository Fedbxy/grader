import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
            verdict: true,
            error: true,
            time: true,
            memory: true,
        },
    })
    if (!submission) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET submission ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    return NextResponse.json(submission);
}