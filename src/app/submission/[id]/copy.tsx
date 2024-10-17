"use client";

import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ code }: { code: string }) {
  return (
    <Button
      className="h-8 w-8"
      variant="outline"
      size="icon"
      onClick={() => navigator.clipboard.writeText(code)}
    >
      <Clipboard className="h-4 w-4" />
    </Button>
  );
}
