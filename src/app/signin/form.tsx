"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/zod/user";
import { signin } from "@/actions/auth";
import { useTurnstile } from "@/hooks/turnstile";
import { handleTurnstileStatus } from "@/utils/turnstile";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";

export function SignInForm({
    nextUrl,
    siteKey,
}: {
    nextUrl?: string;
    siteKey: string;
}) {
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const {
        turnstileRef,
        turnstileToken,
        turnstileStatus,
        handleTurnstileError,
        handleTurnstileExpire,
        handleTurnstileSuccess,
        resetTurnstile,
    } = useTurnstile();

    async function onSubmit(values: z.infer<typeof signInSchema>) {
        if (handleTurnstileStatus(turnstileStatus)) {
            return;
        }

        const data = new FormData();
        data.append("turnstileToken", turnstileToken as string);
        data.append("username", values.username);
        data.append("password", values.password);

        const response = await signin(data, nextUrl);

        if (response?.error) {
            resetTurnstile();
            return toast.error(response.error);
        }

        return toast.success("You have successfully signed in.");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Turnstile
                    ref={turnstileRef}
                    siteKey={siteKey}
                    onError={handleTurnstileError}
                    onExpire={handleTurnstileExpire}
                    onSuccess={handleTurnstileSuccess}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </Form>
    );
}