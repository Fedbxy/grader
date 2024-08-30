"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProblemSchema } from "@/lib/zod/problem";
import { createProblem } from "@/actions/admin/problem";
import { messages } from "@/config/messages";
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
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function CreateProblemForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof createProblemSchema>>({
        resolver: zodResolver(createProblemSchema),
        defaultValues: {
            title: "",
            visibility: "private",
            timeLimit: "1000",
            memoryLimit: "32",
            score: "100",
            testcases: "10",
        },
    });

    async function onSubmit(values: z.infer<typeof createProblemSchema>) {
        const data = new FormData();
        data.append("title", values.title);
        if (values.statement) data.append("statement", values.statement);
        if (values.testcase) data.append("testcase", values.testcase);
        data.append("visibility", values.visibility);
        data.append("timeLimit", values.timeLimit);
        data.append("memoryLimit", values.memoryLimit);
        data.append("score", values.score);
        data.append("testcases", values.testcases);

        const response = await createProblem(data);

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
            description: "You have successfully created a problem.",
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="statement"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Statement (PDF)</FormLabel>
                            <FormControl>
                                <Input
                                    {...fieldProps}
                                    placeholder="Statement"
                                    type="file"
                                    accept={limits.statement.type.join(", ")}
                                    onChange={(event) =>
                                        onChange(event.target.files && event.target.files[0])
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="testcase"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Testcase (ZIP)</FormLabel>
                            <FormControl>
                                <Input
                                    {...fieldProps}
                                    placeholder="Testcase"
                                    type="file"
                                    accept={limits.testcase.type.join(", ")}
                                    onChange={(event) =>
                                        onChange(event.target.files && event.target.files[0])
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a visibility" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time Limit</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="memoryLimit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Memory Limit</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Score</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="testcases"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Testcases</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
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
                    {form.formState.isSubmitting ? "Creating..." : "Create"}
                </Button>
            </form>
        </Form>
    );
}