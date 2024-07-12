"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/zod";
import { signup } from "@/actions/auth";
import { messages } from "@/config/messages";

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
import { useToast } from "@/components/ui/use-toast";

export function SignUpForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof signUpSchema>) {
        const data = new FormData();
        data.append("username", values.username);
        data.append("password", values.password);
        data.append("confirmPassword", values.confirmPassword);

        const response = await signup(data);

        if (response?.error) {
            return toast({
                variant: "destructive",
                title: messages.toast.error,
                description: response.error,
            });
        }

        return toast({
            variant: "constructive",
            title: messages.toast.success,
            description: "You have successfully signed up.",
        });
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