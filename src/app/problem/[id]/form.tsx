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
import Link from "next/link";

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
import { Card } from "@/components/ui/card";

export function SubmitForm({
  siteKey,
  problemId,
  latestCode,
  latestLanguage,
  disabled,
}: {
  siteKey: string;
  problemId: number;
  latestCode: string;
  latestLanguage?: Language;
  disabled?: boolean;
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
    if (disabled) {
      return;
    }

    if (handleTurnstileStatus(turnstileStatus)) {
      return;
    }

    const data = new FormData();
    data.append("turnstileToken", turnstileToken as string);
    data.append("problemId", problemId.toString());
    data.append("language", values.language);
    data.append("code", values.code);

    const response = await submitCode(data);

    if (response?.error) {
      resetTurnstile();
      return toast.error(response.error);
    }

    return toast.success("Your solution has been submitted.");
  }

  return (
    <div className="relative">
      {disabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
          <Link href={`/signin?nextUrl=problem/${problemId}/statement`}>
            <Button variant="outline">
              You need to be signed in to submit a solution.
            </Button>
          </Link>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`space-y-4 ${disabled ? "p-2 opacity-50" : ""}`}
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  {isCodeEditor ? (
                    <Card className="overflow-hidden">
                      <CodeEditor
                        code={field.value}
                        language={form.watch("language")}
                        onChange={(code) => form.setValue("code", code)}
                        readOnly={disabled}
                      />
                    </Card>
                  ) : (
                    <Textarea
                      className="h-48 font-mono"
                      readOnly={disabled}
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
                <FormDescription className="text-xs">
                  {isCodeEditor
                    ? "Couldn't use the code editor?"
                    : "Use the code editor instead?"}{" "}
                  <span
                    className="link text-primary"
                    onClick={() => setIsCodeEditor((prev) => !prev)}
                  >
                    Click here
                  </span>
                  .
                </FormDescription>
              </FormItem>
            )}
          />
          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={disabled}
                  >
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
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
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
            disabled={disabled || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
