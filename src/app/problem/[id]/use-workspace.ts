"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useWatch, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { runSchema } from "@/lib/zod/judge";
import { submitCode } from "@/actions/judge";
import { runCode } from "@/actions/run";
import { messages } from "@/config/messages";
import { Language } from "@/types/submission";
import { useRun } from "@/hooks/run";
import { useDraft } from "./use-draft";

export type WorkspaceValues = z.infer<typeof runSchema>;

// Everything the code side of the workspace shares: the form (language, code,
// and the input for a run), submitting, and running. It lives above the
// layouts so that the code survives the window crossing the phone breakpoint.
export function useWorkspace({
  problemId,
  latestCode,
  latestLanguage,
  disabled,
  initialRun,
  viewerId,
}: {
  problemId: number;
  latestCode: string;
  latestLanguage?: Language;
  disabled?: boolean;
  // The viewer's last run on this problem, shown again with its input.
  initialRun?: { id: number; input: string };
  // Signed in: the code is kept as a draft in this browser.
  viewerId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isCodeEditor, setIsCodeEditor] = useState(() => {
    const codeEditorParam = searchParams.get("codeEditor");
    return codeEditorParam ? codeEditorParam === "true" : true;
  });

  // The path at mount: after Submit, router.push changes usePathname before
  // this unmounts, and the effect would stamp ?codeEditor= on the next page.
  const [workspacePath] = useState(pathname);
  useEffect(() => {
    window.history.replaceState(
      {},
      "",
      `${workspacePath}?codeEditor=${isCodeEditor}`,
    );
  }, [workspacePath, isCodeEditor]);

  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(runSchema),
    defaultValues: {
      language: latestLanguage,
      code: latestCode,
      input: initialRun?.input ?? "",
    },
  });
  const language = useWatch({ control: form.control, name: "language" });
  const draft = useDraft(form, problemId, viewerId);

  // Reset code: back to the last submission's code and language (an empty
  // editor without one), and the draft is forgotten. The input stays.
  function resetCode() {
    draft.clear();
    form.reset(
      { ...form.getValues(), code: latestCode, language: latestLanguage },
      { keepDefaultValues: true },
    );
  }

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [runId, setRunId] = useState<number | null>(initialRun?.id ?? null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Turnstile guards Submit only: Submit checks the form and opens a popover
  // with the widget, and passing it sends the submission.
  const [isVerifying, setIsVerifying] = useState(false);
  const run = useRun(runId);

  // A 404 (the run expired) leaves no data, so isRunning alone would never
  // settle.
  const isExpired = runId !== null && !!run.error;
  const isRunning = isStarting || (runId !== null && !run.error && run.isRunning);

  // Where the input's error shows, so open the panel to see it.
  function handleInvalid(errors: FieldErrors<WorkspaceValues>) {
    if (errors.input) {
      setIsPanelOpen(true);
    }
  }

  async function onRun(values: WorkspaceValues) {
    const data = new FormData();
    data.append("problemId", problemId.toString());
    data.append("language", values.language as string);
    data.append("code", values.code);
    data.append("input", values.input);

    setIsStarting(true);
    setIsPanelOpen(true);
    const response = await runCode(data);
    setIsStarting(false);

    if (response?.runId === undefined) {
      return toast.error(response?.error ?? messages.form.noResponse);
    }

    setRunId(response.runId);
  }

  async function onSubmit(token: string) {
    const values = form.getValues();
    const data = new FormData();
    data.append("turnstileToken", token);
    data.append("problemId", problemId.toString());
    data.append("language", values.language as string);
    data.append("code", values.code);

    setIsSubmitting(true);
    const response = await submitCode(data);
    setIsSubmitting(false);
    // A token is single use, so a retry needs a fresh widget.
    setIsVerifying(false);

    // Saved only when the action says where to go next. No result at all is
    // what a request blocked before reaching the server (by a firewall) gives.
    if (!response?.redirectTo) {
      toast.error(response?.error ?? messages.form.noResponse);
      return;
    }

    toast.success("Your solution has been submitted.");
    router.push(response.redirectTo);
  }

  // Validation is async, so a second Ctrl+Enter or click can arrive before the
  // state says a run has started; one at a time covers both buttons.
  const inFlight = useRef(false);
  function once(action: () => Promise<void>) {
    if (disabled || inFlight.current) {
      return;
    }
    inFlight.current = true;
    void action().finally(() => {
      inFlight.current = false;
    });
  }

  const handleRun = form.handleSubmit(onRun, handleInvalid);
  // Only the fields a submission sends: the run's input must not block it.
  async function handleSubmit() {
    if (await form.trigger(["language", "code"])) {
      setIsVerifying(true);
    }
  }

  return {
    form,
    language,
    disabled: !!disabled,
    isCodeEditor,
    toggleCodeEditor: () => setIsCodeEditor((prev) => !prev),
    isPanelOpen,
    togglePanel: () => setIsPanelOpen((prev) => !prev),
    setPanelOpen: setIsPanelOpen,
    draftStatus: draft.status,
    resetCode,
    hasSubmission: latestLanguage !== undefined,
    run: {
      id: runId,
      data: run.data,
      isRunning,
      isStarting,
      isExpired,
      // Does nothing while signed out or while a request is out. During a
      // run it starts a new one, which replaces it.
      start: () => once(handleRun),
    },
    submit: {
      isSubmitting,
      isVerifying,
      // Closing the popover cancels, except while the submission is sending.
      setVerifying: (open: boolean) => {
        if (!isSubmitting) {
          setIsVerifying(open);
        }
      },
      onToken: (token: string) => once(() => onSubmit(token)),
      handle: (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        once(handleSubmit);
      },
    },
  };
}

export type Workspace = ReturnType<typeof useWorkspace>;
