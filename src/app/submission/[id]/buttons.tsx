"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { rejudge } from "@/actions/admin/judge";
import { setSubmissionHidden } from "@/actions/admin/submission";
import { useSWRConfig } from "swr";

import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      className="h-8 w-8"
      variant="outline"
      size="icon"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
    </Button>
  );
}

export function RejudgeButton({ id }: { id: number }) {
    const { mutate } = useSWRConfig();

    async function handleRejudge() {
        const result = await rejudge(id);

        if (result?.error) {
            return toast.error(result.error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        mutate(`/api/submission/${id}`);

        return toast.success(`Requested rejudging for submission #${id}.`);
    }

    return (
        <Button
        className="h-8 w-8"
        variant="outline"
        size="icon"
        onClick={handleRejudge}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    );
}

export function HideButton({ id, hidden }: { id: number; hidden: boolean }) {
    const router = useRouter();

    async function handleToggle() {
        const result = await setSubmissionHidden(id, !hidden);

        if (result?.error) {
            return toast.error(result.error);
        }

        router.refresh();

        return toast.success(
            `Submission #${id} is now ${hidden ? "shown" : "hidden"}.`,
        );
    }

    return (
        <Button
            className="h-8 w-8"
            variant="outline"
            size="icon"
            title={hidden ? "Show submission" : "Hide submission"}
            onClick={handleToggle}
        >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
    );
}
