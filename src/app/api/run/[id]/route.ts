import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            statusCode: 400,
            method: request.method,
            message: "Invalid run ID",
            error: "Bad Request",
        }, { status: 400 });
    }

    const run = await prisma.run.findUnique({
        where: { id: Number(params.id) },
        select: {
            id: true,
            status: true,
            judgeStatus: true,
            verdict: true,
            exitCode: true,
            exitSignal: true,
            stdout: true,
            stdoutTruncated: true,
            stderr: true,
            stderrTruncated: true,
            time: true,
            memory: true,
            errorCode: true,
            error: true,
            userId: true,
        },
    });
    const { user } = await validateRequest();
    // Runs are private scratch work: only the owner can read one, admins
    // included.
    if (!run || !user || run.userId !== user.id) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET run ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    const { userId, ...body } = run;
    return NextResponse.json(body);
}
