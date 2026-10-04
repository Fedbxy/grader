"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { rejudge } from "@/actions/admin/judge";
import { setSubmissionHidden } from "@/actions/admin/submission";
import { setCodePublic } from "@/actions/submission";
import { useSWRConfig } from "swr";

import { Check, Clipboard, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";

// A square icon button for the code toolbar. The tooltip doubles as its name.
function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="h-8 w-8"
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolbarButton label="Copy code" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
    </ToolbarButton>
  );
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ToolbarButton label="Copy link" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
    </ToolbarButton>
  );
}

export function ShareSwitch({
  id,
  codePublic,
  hidden,
}: {
  id: number;
  codePublic: boolean;
  hidden: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleToggle(checked: boolean) {
    const result = await setCodePublic(id, checked);

    if (result?.error) {
      return toast.error(result.error);
    }

    startTransition(() => router.refresh());

    return toast.success(
      `Code for submission #${id} is now ${checked ? "shared" : "private"}.`,
    );
  }

  // A hidden submission can't start sharing; sharing already on can stop.
  const blocked = hidden && !codePublic;

  const control = (
    <div className="flex items-center gap-2">
      <Switch
        id={`share-code-${id}`}
        checked={codePublic}
        disabled={pending || blocked}
        onCheckedChange={handleToggle}
      />
      <Label
        htmlFor={`share-code-${id}`}
        className={blocked ? "text-muted-foreground" : "cursor-pointer"}
      >
        Share code
      </Label>
    </div>
  );

  if (!blocked) {
    return control;
  }

  // Disabled controls don't fire pointer events, so the tooltip hangs off a
  // wrapper.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{control}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Hidden submissions can&apos;t be shared.</p>
      </TooltipContent>
    </Tooltip>
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
        <ToolbarButton label="Rejudge" onClick={handleRejudge}>
            <RefreshCcw className="h-4 w-4" />
        </ToolbarButton>
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
        <ToolbarButton
            label={hidden ? "Show submission" : "Hide submission"}
            onClick={handleToggle}
        >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </ToolbarButton>
    );
}
