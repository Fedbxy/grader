import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ path?: string[] }> }) {
    const params = await props.params;
    return NextResponse.json({
        statusCode: 404,
        method: request.method,
        message: `Cannot GET /${params.path ? params.path.join("/") : ""}`,
        error: "Not Found",
    }, { status: 404 });
}