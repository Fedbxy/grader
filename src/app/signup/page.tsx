import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./form";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default async function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined },
}) {
    const { user } = await validateRequest();
    if (user) {
        return redirect("/");
    }

    const nextUrl = typeof searchParams.nextUrl === "string" ? searchParams.nextUrl : undefined;

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-sm md:max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Create an account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SignUpForm nextUrl={nextUrl} />
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href={`/signin${nextUrl ? `?nextUrl=${nextUrl}` : ""}`} className="underline link">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}