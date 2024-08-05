import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFile } from "@/lib/minio";
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { user } = await validateRequest();

    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            error: "Invalid problem ID",
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
            error: "Problem not found",
        }, { status: 404 });
    }

    if (problem.visibility === "private" && user?.role !== "admin") {
        return NextResponse.json({
            error: "Forbidden",
        }, { status: 403 });
    }

    const statement = await getFile(`problem/${params.id}/statement.pdf`) as Buffer || null;
    if (!statement) {
        return NextResponse.json({
            error: "Statement not found",
        }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    return new NextResponse(statement, { headers });
}