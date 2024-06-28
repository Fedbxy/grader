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
import { SignInForm } from "./form";

export default async function Page() {
    const { user } = await validateRequest();
    if (user) {
        return redirect("/");
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-xs md:max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>Sign in to your account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SignInForm />
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline">
                            Sign Up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}