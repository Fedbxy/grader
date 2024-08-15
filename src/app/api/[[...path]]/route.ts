import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    return NextResponse.json({
        statusCode: 404,
        method: request.method,
        message: `Cannot GET /${params.path ? params.path.join("/") : ""}`,
        error: "Not Found",
    }, { status: 404 });
}