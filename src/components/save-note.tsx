"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/shadcn";

type SaveStatus = "idle" | "saving" | "saved";

// Where a section is in saving: idle, a save in flight, or just saved (which
// fades back to idle after a moment, so the note never lingers).
export function useSaveStatus(visibleFor = 2500) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const saving = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("saving");
  }, []);

  const saved = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("saved");
    timer.current = setTimeout(() => setStatus("idle"), visibleFor);
  }, [visibleFor]);

  // A save that failed says so beside its field, not here.
  const idle = useCallback(() => {
    clearTimeout(timer.current);
    setStatus("idle");
  }, []);

  return { status, saving, saved, idle };
}

// The quiet note beside what was saved. Always in the page, so screen readers
// hear it change.
export function SaveNote({
  status,
  label = "Saved",
  className,
  labelClassName,
}: {
  status: SaveStatus;
  label?: string;
  className?: string;
  // For hiding the words but not the check where space is short.
  labelClassName?: string;
}) {
  return (
    <p
      role="status"
      className={cn(
        "flex h-5 shrink-0 items-center gap-1 text-sm text-muted-foreground",
        className,
      )}
      title={status === "saved" ? label : undefined}
    >
      {status === "saving" && "Saving…"}
      {status === "saved" && (
        <>
          <Check className="h-4 w-4 text-constructive dark:text-green-400" />
          <span className={labelClassName}>{label}</span>
        </>
      )}
    </p>
  );
}
