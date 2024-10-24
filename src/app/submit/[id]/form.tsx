"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitSchema } from "@/lib/zod/judge";
import { submitCode } from "@/actions/judge";
import { limits } from "@/config/limits";
import { Language } from "@/types/submission";
import { useTurnstile } from "@/hooks/turnstile";
import { handleTurnstileStatus } from "@/utils/turnstile";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Turnstile } from "@marsidev/react-turnstile";
import { CodeEditor } from "@/components/code-editor";

export function SubmitForm({
  siteKey,
  problemId,
  userId,
  latestCode,
  latestLanguage,
}: {
  siteKey: string;
  problemId: number;
  userId: number;
  latestCode: string;
  latestLanguage?: Language;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCodeEditor, setIsCodeEditor] = useState(() => {
    const codeEditorParam = searchParams.get("codeEditor");
    return codeEditorParam ? codeEditorParam === "true" : true;
  });

  useEffect(() => {
    window.history.replaceState(
      {},
      "",
      `${pathname}?codeEditor=${isCodeEditor}`,
    );
  }, [pathname, isCodeEditor]);

  const form = useForm<z.infer<typeof submitSchema>>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      language: latestLanguage,
      code: latestCode,
    },
  });

  const [fileInput, setFileInput] = useState<File | null>(null);
  const {
    turnstileRef,
    turnstileToken,
    turnstileStatus,
    handleTurnstileError,
    handleTurnstileExpire,
    handleTurnstileSuccess,
    resetTurnstile,
  } = useTurnstile();

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
    if (handleTurnstileStatus(turnstileStatus)) {
      return;
    }

    const data = new FormData();
    data.append("turnstileToken", turnstileToken as string);
    data.append("problemId", problemId.toString());
    data.append("userId", userId.toString());
    data.append("language", values.language);
    data.append("code", values.code);

    const response = await submitCode(data);

    if (response?.error) {
      resetTurnstile();
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
                {isCodeEditor ? (
                  <div className="rounded-md border p-2">
                    <CodeEditor
                      code={field.value}
                      language={form.watch("language")}
                      onChange={(code) => form.setValue("code", code)}
                    />
                  </div>
                ) : (
                  <Textarea className="h-48 font-mono" {...field} />
                )}
              </FormControl>
              <FormMessage />
              <FormDescription className="text-xs">
                {isCodeEditor
                  ? "Couldn't use the code editor?"
                  : "Use the code editor instead?"}{" "}
                <span
                  className="text-primary link"
                  onClick={() => setIsCodeEditor((prev) => !prev)}
                >
                  Click here
                </span>
                .
              </FormDescription>
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
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
