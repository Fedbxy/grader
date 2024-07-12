"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/zod";
import { changePassword } from "@/actions/user";
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

export function ChangePasswordForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
        const data = new FormData();
        data.append("password", values.password);
        data.append("newPassword", values.newPassword);
        data.append("confirmNewPassword", values.confirmNewPassword);

        const response = await changePassword(data);

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
            description: "Successfully changed your password.",
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
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
                    {form.formState.isSubmitting ? "Saving..." : "Save changes"}
                </Button>
            </form>
        </Form>
    );
}