"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useDefaultLayout, usePanelRef } from "react-resizable-panels";
import Link from "next/link";
import { limits } from "@/config/limits";
import { maps } from "@/config/messages";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Kbd } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/spinner";
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
import { SaveNote } from "@/components/save-note";
import { CodeEditor } from "@/components/code-editor";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Play,
  TextCursorInput,
  Upload,
} from "lucide-react";
import { RunOutput, RunStatus, runSummary } from "./run-output";
import { layoutStorage, TOOLBAR } from "./strips";
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
    // Not hoverable: Run's wide tooltip reaches over the toggle beside it,
    // and Radix would hold the toggle's back while the pointer seemed to be
    // heading for Run's.
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// The Input/Output panel on a desktop: never thinner than this in pixels
// while open, and this share of the code pane until the viewer resizes it.
const RUN_PANEL_MIN = 120;
const RUN_PANEL_DEFAULT = "35%";

// The label row above Input and Output.
const PANEL_HEADER = "flex h-9 shrink-0 items-center gap-2 border-b px-3";

// What the shortcut is called here: Cmd on a Mac, Ctrl elsewhere. The server
// can't know, so it renders the Ctrl one.
function useShortcutHint() {
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
  return isMac ? "⌘↵" : "Ctrl+Enter";
}

// Language and file on top, the editor, the run panel (closed until a run),
// and a bar with Run, the panel toggle and Submit (whose captcha pops over it).
export function CodePane({
  workspace: w,
  problemId,
  siteKey,
  resizable,
}: {
  workspace: Workspace;
  problemId: number;
  siteKey: string;
  // Desktop: the editor, Input and Output can be resized by dragging.
  resizable: boolean;
}) {
  const { form } = w;
  const fileInput = useRef<HTMLInputElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const runPanel = usePanelRef();
  // The editor/panel and Input/Output splits, as the viewer last left them,
  // the panel's being closed included.
  const codeLayout = useDefaultLayout({ id: "workspace-code", storage: layoutStorage });
  const runLayout = useDefaultLayout({ id: "workspace-run", storage: layoutStorage });
  const shortcutHint = useShortcutHint();
  const summary = runSummary(w.run.data, {
    starting: w.run.isStarting,
    expired: w.run.isExpired,
  });

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

  // The editor, Input and Output, laid out below: resizable on a desktop,
  // stacked on a phone.
  const editor = (
    <FormField
      control={form.control}
      name="code"
      render={({ field }) => (
        <FormItem
          className={`relative flex flex-col [&>*+*]:mt-0 ${resizable ? "h-full" : "min-h-64 flex-1"}`}
        >
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
                    onRun={w.run.start}
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

  const input = (
    <FormField
      control={form.control}
      name="input"
      render={({ field }) => (
        <FormItem className="flex h-full min-h-0 min-w-0 flex-col [&>*+*]:mt-0">
          <div className={PANEL_HEADER}>
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Input
            </FormLabel>
            <FormMessage className="ml-auto truncate text-xs" />
          </div>
          <FormControl>
            <Textarea
              className="field-sizing-fixed min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-2 font-mono text-sm focus-visible:ring-0 dark:bg-transparent"
              placeholder="Input for your program"
              readOnly={w.disabled}
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

  const output = (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className={PANEL_HEADER}>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Output
        </span>
        <RunStatus
          runId={w.run.id}
          run={w.run.data}
          starting={w.run.isStarting}
          expired={w.run.isExpired}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <RunOutput
          runId={w.run.id}
          run={w.run.data}
          starting={w.run.isStarting}
          expired={w.run.isExpired}
          shortcutHint={shortcutHint}
        />
      </div>
    </div>
  );

  // Keep the run panel in step with the toggle (and with Run, which opens it).
  // Not on the first pass: a panel restored closed reports its size through
  // onResize first, and expanding it here would undo the saved layout.
  const synced = useRef(false);
  useEffect(() => {
    const panel = runPanel.current;
    if (!resizable || !panel) {
      return;
    }
    if (!synced.current) {
      synced.current = true;
      return;
    }
    if (w.isPanelOpen && panel.isCollapsed()) {
      panel.expand();
      // expand() returns to the size from before it closed, which a reload
      // forgets; it then opens at the bare minimum. Use the default instead.
      requestAnimationFrame(() => {
        if (panel.getSize().inPixels <= RUN_PANEL_MIN + 1) {
          panel.resize(RUN_PANEL_DEFAULT);
        }
      });
    } else if (!w.isPanelOpen && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [resizable, w.isPanelOpen, runPanel]);

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
                  // Controlled: a draft restored after load changes it.
                  value={field.value ?? ""}
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
          <SaveNote
            status={w.draftStatus}
            label="Draft saved locally"
            className="text-xs [&_svg]:size-3.5"
            // Where the words don't fit, just the check (the words stay for
            // screen readers and on hover).
            labelClassName="sr-only @[38rem]/toolbar:not-sr-only"
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

        {resizable ? (
          // Desktop: drag the line above the panel to make it taller, or all
          // the way down to close it; drag between Input and Output to
          // share the width.
          <ResizablePanelGroup
            orientation="vertical"
            className="min-h-0 flex-1"
            defaultLayout={codeLayout.defaultLayout}
            onLayoutChanged={codeLayout.onLayoutChanged}
          >
            <ResizablePanel id="editor" minSize={120}>
              {editor}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              id="run"
              panelRef={runPanel}
              collapsible
              collapsedSize={0}
              minSize={RUN_PANEL_MIN}
              defaultSize={RUN_PANEL_DEFAULT}
              // Dragging it shut (or open) is the same as the toggle.
              onResize={(size) => w.setPanelOpen(size.inPixels > 0)}
            >
              <ResizablePanelGroup
                orientation="horizontal"
                defaultLayout={runLayout.defaultLayout}
                onLayoutChanged={runLayout.onLayoutChanged}
              >
                <ResizablePanel id="input" minSize={120} defaultSize="50%">
                  {input}
                </ResizablePanel>
                <ResizableHandle withHandle />
                {/* 136px is the narrowest where the header still fits the
                    "Output" label and both cut parts as "…". */}
                <ResizablePanel id="output" minSize={136} defaultSize="50%">
                  {output}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            {editor}
            {w.isPanelOpen && (
              <div className="@container shrink-0 border-t">
                <div className="grid h-80 grid-cols-1 grid-rows-2 divide-y @lg:h-56 @lg:grid-cols-2 @lg:grid-rows-1 @lg:divide-x @lg:divide-y-0">
                  {input}
                  {output}
                </div>
              </div>
            )}
          </>
        )}

        {/* Sticky because on a phone the pane scrolls, and Run must stay in reach. */}
        <div className="sticky bottom-0 z-10 flex shrink-0 items-center gap-2 border-t bg-[color-mix(in_oklch,var(--background),var(--muted)_30%)] p-3">
          <Tip label="Run your code on the input above, without submitting">
            <Button
              type="button"
              variant="constructive"
              // Only while the request is out: pressing Run during a run
              // replaces it, and the token bucket limits how fast.
              disabled={w.disabled || w.run.isStarting}
              onClick={w.run.start}
            >
              {w.run.isStarting ? <LoadingSpinner size={14} /> : <Play />}
              Run
              <Kbd className="hidden bg-transparent text-current opacity-70 sm:inline-flex">
                {shortcutHint}
              </Kbd>
            </Button>
          </Tip>
          <Tip
            label={
              w.isPanelOpen ? "Hide input and output" : "Show input and output"
            }
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                w.isPanelOpen
                  ? "Hide input and output"
                  : "Show input and output"
              }
              aria-expanded={w.isPanelOpen}
              onClick={w.togglePanel}
            >
              {w.isPanelOpen ? <ChevronDown /> : <ChevronUp />}
            </Button>
          </Tip>
          {/* With the panel open, its header already says how the run went. */}
          <span
            className={`min-w-0 truncate text-sm text-muted-foreground ${w.isPanelOpen ? "sr-only" : ""}`}
            aria-live="polite"
          >
            {summary}
          </span>
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
