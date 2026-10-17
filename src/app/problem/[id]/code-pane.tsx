"use client";

import { useRef } from "react";
import Link from "next/link";
import { limits } from "@/config/limits";
import { maps } from "@/config/messages";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TurnstileWithSkeleton } from "@/components/turnstile";
import { CodeEditor } from "@/components/code-editor";
import {
  Code,
  TextCursorInput,
  Upload,
} from "lucide-react";
import { TOOLBAR } from "./strips";
import type { Workspace } from "./use-workspace";

// A control with a tooltip saying what it does.
function Tip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// Language and file on top, the editor, and a bar with Submit (whose captcha
// pops over it).
export function CodePane({
  workspace: w,
  problemId,
  siteKey,
}: {
  workspace: Workspace;
  problemId: number;
  siteKey: string;
}) {
  const { form } = w;
  const fileInput = useRef<HTMLInputElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  // Clears the "code is required" error as soon as there is code again.
  function setCode(code: string) {
    form.setValue("code", code, {
      shouldValidate: !!form.getFieldState("code").error,
    });
  }

  function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCode(reader.result as string);
    };
    reader.readAsText(file);
  }

  const editor = (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem className="relative flex min-h-64 flex-1 flex-col md:min-h-32 [&>*+*]:mt-0">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {w.disabled && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center backdrop-blur-xs">
                <Link href={`/signin?nextUrl=problem/${problemId}`}>
                  <Button type="button" variant="outline">
                    You need to be signed in to submit a solution.
                  </Button>
                </Link>
              </div>
            )}
            <div
              className={`absolute inset-0 ${w.disabled ? "opacity-50" : ""}`}
            >
              <FormControl>
                {w.isCodeEditor ? (
                  <CodeEditor
                    code={field.value}
                    language={w.language ?? ""}
                    height="100%"
                    onChange={setCode}
                    readOnly={w.disabled}
                  />
                ) : (
                  <Textarea
                    className="field-sizing-fixed h-full resize-none rounded-none border-0 bg-transparent font-mono focus-visible:ring-0 dark:bg-transparent"
                    readOnly={w.disabled}
                    {...field}
                  />
                )}
              </FormControl>
            </div>
          </div>
          <FormMessage className="absolute right-3 bottom-2 z-10 rounded-md bg-background/90 px-2 py-1" />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={w.submit.handle}
        className="flex h-full min-h-0 flex-col overflow-y-auto md:overflow-visible"
      >
        {/* A container: what fits depends on the pane's width, which the
            viewer drags, not on the screen's. */}
        <div className={`${TOOLBAR} @container/toolbar`}>
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="flex min-w-0 items-center gap-2 [&>*+*]:mt-0">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={w.disabled}
                >
                  <FormControl>
                    <SelectTrigger
                      size="sm"
                      className="w-auto min-w-0 sm:min-w-44"
                    >
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(maps.language).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="truncate" />
              </FormItem>
            )}
          />
          <div className="ml-auto flex items-center gap-1">
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              accept={limits.codeFile.type.join(", ")}
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                // So that picking the same file again still counts as a change.
                event.target.value = "";
              }}
            />
            <Tip label="Load your code from a .cpp, .c or .py file">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={w.disabled}
                onClick={() => fileInput.current?.click()}
              >
                <Upload />
                <span className="sr-only @[30rem]/toolbar:not-sr-only">
                  Upload file
                </span>
              </Button>
            </Tip>
            <Tip
              label={
                w.isCodeEditor
                  ? "Switch to a plain textarea, if the editor gives you trouble"
                  : "Switch back to the code editor"
              }
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={w.toggleCodeEditor}
              >
                {w.isCodeEditor ? <TextCursorInput /> : <Code />}
                <span className="sr-only @[30rem]/toolbar:not-sr-only">
                  {w.isCodeEditor ? "Plain textarea" : "Code editor"}
                </span>
              </Button>
            </Tip>
          </div>
        </div>

        {editor}

        {/* Sticky because on a phone the pane scrolls, and Submit must stay in reach. */}
        <div className="sticky bottom-0 z-10 flex shrink-0 items-center gap-2 border-t bg-[color-mix(in_oklch,var(--background),var(--muted)_30%)] p-3">
          <Popover
            open={w.submit.isVerifying}
            onOpenChange={w.submit.setVerifying}
          >
            <PopoverAnchor asChild>
              <Tip label="Submit for judging against all the tests">
                <Button
                  ref={submitButton}
                  type="submit"
                  className="ml-auto"
                  disabled={w.disabled || w.submit.isSubmitting}
                >
                  {w.submit.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </Tip>
            </PopoverAnchor>
            <PopoverContent
              side="top"
              align="end"
              className="w-[calc(300px+2rem)] max-w-[calc(100vw-2rem)]"
              // Submit itself is outside the popover: pressing it again
              // must not close and remount the widget.
              onInteractOutside={(event) => {
                if (submitButton.current?.contains(event.target as Node)) {
                  event.preventDefault();
                }
              }}
            >
              <TurnstileWithSkeleton
                siteKey={siteKey}
                onSuccess={w.submit.onToken}
              />
            </PopoverContent>
          </Popover>
        </div>
      </form>
    </Form>
  );
}
