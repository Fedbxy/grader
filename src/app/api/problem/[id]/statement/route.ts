import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFile } from "@/lib/minio";
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { user } = await validateRequest();

    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            statusCode: 400,
            method: request.method,
            message: "Invalid problem ID",
            error: "Bad Request",
        }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
        where: { id: Number(params.id) },
        include: {
            author: true,
        },
    })
    if (!problem) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET problem ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    if (problem.visibility === "private" && user?.role !== "admin") {
        return NextResponse.json({
            statusCode: 403,
            method: request.method,
            message: `You are not allowed to access problem ${params.id}`,
            error: "Forbidden",
        }, { status: 403 });
    }

    const statement = await getFile(`problem/${params.id}/statement.pdf`) as Buffer || null;
    if (!statement) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET statement for problem ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    const body = new Uint8Array(statement);

    return new NextResponse(body, { headers });
}