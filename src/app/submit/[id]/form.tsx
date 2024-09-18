"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitSchema } from "@/lib/zod/judge";
import { submitCode } from "@/actions/judge";
import { limits } from "@/config/limits";

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
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function SubmitForm({ problemId, userId }: { problemId: number, userId: number }) {
    const form = useForm<z.infer<typeof submitSchema>>({
        resolver: zodResolver(submitSchema),
        defaultValues: {
            language: undefined, 
            code: "",
        },
    });

    const [fileInput, setFileInput] = useState<File | null>(null);

    useEffect(() => {
        if (fileInput) {
            const reader = new FileReader();
            reader.onload = () => {
                const code = reader.result as string;
                form.setValue("code", code);
            };
            reader.readAsText(fileInput);
        }
    }, [fileInput, form]);

    async function onSubmit(values: z.infer<typeof submitSchema>) {
        const data = new FormData();
        data.append("problemId", problemId.toString());
        data.append("userId", userId.toString());
        data.append("language", values.language);
        data.append("code", values.code);

        const response = await submitCode(data);

        if (response?.error) {
            return toast.error(response.error);
        }

        return toast.success("Your code has been submitted.");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a language" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="cpp">C++</SelectItem>
                                    <SelectItem value="c">C</SelectItem>
                                    <SelectItem value="py">Python</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="font-mono h-48"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                        <Input
                            placeholder="Upload File"
                            type="file"
                            accept={limits.codeFile.type.join(", ")}
                            onChange={(event) =>
                                setFileInput(event.target.files && event.target.files[0])
                            }
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </form>
        </Form>
    );
}