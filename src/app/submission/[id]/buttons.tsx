"use client";

import { useState } from "react";
import { toast } from "sonner";
import { rejudge } from "@/actions/admin/judge";
import { useSWRConfig } from "swr";

import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

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
