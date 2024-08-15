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

export default async function Page() {
    const { user } = await validateRequest();
    if (user) {
        return redirect("/");
    }

    return (
        <div className="container mx-auto py-10 flex justify-center">
            <Card className="w-full max-w-xs md:max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>Create an account to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SignUpForm />
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/signin" className="underline">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}