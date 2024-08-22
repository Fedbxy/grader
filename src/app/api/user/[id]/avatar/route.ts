import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFile } from "@/lib/minio";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            statusCode: 400,
            method: request.method,
            message: "Invalid user ID",
            error: "Bad Request",
        }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
    })
    if (!user) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET user ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    if (!user.avatar) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `User ${params.id} has no avatar`,
            error: "Not Found",
        }, { status: 404 });
    }

    const avatar = await getFile(user.avatar);
    if (!avatar) {
        return NextResponse.json({
            statusCode: 404,
            method: request.method,
            message: `Cannot GET avatar for user ${params.id}`,
            error: "Not Found",
        }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", `image/${user.avatar.split("/")[2].split(".")[1]}`);

    return new NextResponse(avatar, { headers });
}