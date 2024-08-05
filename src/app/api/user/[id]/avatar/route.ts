import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getFile } from "@/lib/minio";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (isNaN(Number(params.id))) {
        return NextResponse.json({
            error: "Invalid user ID",
        }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(params.id) },
    })
    if (!user) {
        return NextResponse.json({
            error: "User not found",
        }, { status: 404 });
    }

    if (!user.avatar) {
        return NextResponse.json({
            error: "User has no avatar",
        }, { status: 404 });
    }

    const avatar = await getFile(user.avatar);
    if (!avatar) {
        return NextResponse.json({
            error: "Avatar not found",
        }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", `image/${user.avatar.split("/")[2].split(".")[1]}`);

    return new NextResponse(avatar, { headers });
}