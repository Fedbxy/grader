"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";

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
