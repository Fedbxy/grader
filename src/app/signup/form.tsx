"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/zod/user";
import { signup } from "@/actions/auth";
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
import { TurnstileWithSkeleton } from "@/components/turnstile";

export function SignUpForm({
    nextUrl,
    siteKey,
}: {
    nextUrl?: string;
    siteKey: string;
}) {
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
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
    
    async function onSubmit(values: z.infer<typeof signUpSchema>) {
        if (handleTurnstileStatus(turnstileStatus)) {
            return;
        }

        const data = new FormData();
        data.append("turnstileToken", turnstileToken as string);
        data.append("username", values.username);
        data.append("password", values.password);
        data.append("confirmPassword", values.confirmPassword);

        const response = await signup(data, nextUrl);

        if (response?.error) {
            resetTurnstile();
            return toast.error(response.error);
        }

        return toast.success("You have successfully signed up.");
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
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <TurnstileWithSkeleton
                    turnstileRef={turnstileRef}
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
                    {form.formState.isSubmitting ? "Signing up..." : "Sign Up"}
                </Button>
            </form>
        </Form>
    );
}