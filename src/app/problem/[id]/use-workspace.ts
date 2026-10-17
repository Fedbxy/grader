"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { submitSchema } from "@/lib/zod/judge";
import { submitCode } from "@/actions/judge";
import { messages } from "@/config/messages";
import { Language } from "@/types/submission";

export type WorkspaceValues = z.infer<typeof submitSchema>;

// Everything the code side of the workspace shares: the form (language and
// code) and submitting. It lives above the layouts so that the code survives
// the window crossing the phone breakpoint.
export function useWorkspace({
  problemId,
  latestCode,
  latestLanguage,
  disabled,
}: {
  problemId: number;
  latestCode: string;
  latestLanguage?: Language;
  disabled?: boolean;
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
    resolver: zodResolver(submitSchema),
    defaultValues: {
      language: latestLanguage,
      code: latestCode,
    },
  });
  const language = useWatch({ control: form.control, name: "language" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Turnstile guards Submit only: Submit checks the form and opens a popover
  // with the widget, and passing it sends the submission.
  const [isVerifying, setIsVerifying] = useState(false);
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

  // One request at a time: a second click can arrive before the state says
  // the first has started.
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

  async function handleSubmit() {
    if (await form.trigger()) {
      setIsVerifying(true);
    }
  }

  return {
    form,
    language,
    disabled: !!disabled,
    isCodeEditor,
    toggleCodeEditor: () => setIsCodeEditor((prev) => !prev),
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
