"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAccountSchema } from "@/lib/zod";
import { editAccount } from "@/actions/user";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "lucia";

export function EditAccountForm({ user }: { user: User }) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof editAccountSchema>>({
        resolver: zodResolver(editAccountSchema),
        defaultValues: {
            displayName: user.displayName,
            bio: user.bio ?? undefined,
        },
    });

    async function onSubmit(values: z.infer<typeof editAccountSchema>) {
        const data = new FormData();
        data.append("displayName", values.displayName);
        data.append("bio", values.bio);

        let updateData: any = {};

        if (values.displayName !== user.displayName) {
            updateData.displayName = values.displayName;
        }

        if (values.bio !== user.bio) {
            updateData.bio = values.bio;
        }

        if (Object.keys(updateData).length === 0) {
            return toast({
                variant: "destructive",
                title: messages.toast.error,
                description: messages.form.noChanges,
            });
        }

        const response = await editAccount(data);

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
            description: "Your profile has been updated.",
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="resize-none h-48"
                                    {...field}
                                />
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