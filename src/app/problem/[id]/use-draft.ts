"use client";

import { useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useSaveStatus } from "@/components/save-note";
import { maps } from "@/config/messages";
import { Language } from "@/types/submission";
import type { WorkspaceValues } from "./use-workspace";

// How long typing has to pause before the draft is written, as for the
// settings page's fields.
const SAVE_DELAY = 800;

type Draft = Pick<WorkspaceValues, "code" | "language" | "input">;

// Keeps the workspace's code, language and input in this browser, per user
// and problem, so a reload or a closed tab loses nothing. A draft is newer
// than the last submission, so it wins over it when the page loads. Returns
// the status for the "Saved locally" note, and clear() for resetting the code.
export function useDraft(
  form: UseFormReturn<WorkspaceValues>,
  problemId: number,
  viewerId: number | undefined,
) {
  const { status, saved } = useSaveStatus();
  // Per user too: two accounts on one computer don't share drafts.
  const key =
    viewerId === undefined ? null : `grader:draft:${viewerId}:${problemId}`;

  // Restore once the page is in the browser; the server can't read it.
  useEffect(() => {
    if (!key) {
      return;
    }
    const draft = readDraft(key);
    if (draft) {
      form.reset({ ...form.getValues(), ...draft }, { keepDefaultValues: true });
    }
  }, [key, form]);

  useEffect(() => {
    if (!key) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;

    const write = () => {
      timer = undefined;
      const { code, language, input } = form.getValues();
      try {
        localStorage.setItem(key, JSON.stringify({ code, language, input }));
        saved();
      } catch {
        // Storage full or blocked: the code is still in the editor.
      }
    };

    // Only the user's edits; a reset (restoring the draft) has no name.
    const subscription = form.watch((_, { name }) => {
      if (!name) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(write, SAVE_DELAY);
    });

    // Leaving within the delay still saves.
    const flush = () => {
      if (timer) {
        clearTimeout(timer);
        write();
      }
    };
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      subscription.unsubscribe();
      window.removeEventListener("pagehide", flush);
    };
  }, [key, form, saved]);

  // Forget the draft (Reset code). The next edit starts a new one.
  const clear = useCallback(() => {
    if (!key) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing stored to remove, or storage blocked.
    }
  }, [key]);

  return { status, clear };
}

function readDraft(key: string): Partial<Draft> | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object") {
      return null;
    }
    // Only fields that look right, in case the format ever changes.
    const draft: Partial<Draft> = {};
    if (typeof value.code === "string") draft.code = value.code;
    if (value.language in maps.language) draft.language = value.language as Language;
    if (typeof value.input === "string") draft.input = value.input;
    return draft;
  } catch {
    return null;
  }
}
