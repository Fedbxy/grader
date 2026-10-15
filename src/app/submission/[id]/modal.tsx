"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function SubmissionModal({
  id,
  hidden,
  description,
  children,
}: {
  id: number;
  hidden: boolean;
  description: React.ReactNode[];
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      {/* Only the body scrolls, so the title, close button and footer stay put. */}
      <DialogContent
        className="flex max-h-[90vh] flex-col sm:max-w-3xl"
        // The first focusable thing is a tooltip trigger, which opens its
        // tooltip on focus and eats the first Escape.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogHeader>
          {/* The header centres its text on phones; the title is a flex row, so
              it has to be centred as a row. */}
          <DialogTitle className="flex items-center justify-center gap-2 sm:justify-start">
            <span>Submission #{id}</span>
            {hidden && <Badge variant="secondary">Hidden</Badge>}
          </DialogTitle>
          {/* Each part stays on one line; wrapping happens between parts. */}
          <DialogDescription>
            {description.map((part, index) => (
              <Fragment key={index}>
                {index > 0 && " · "}
                <span className="whitespace-nowrap">{part}</span>
              </Fragment>
            ))}
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          {children}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {/* A plain anchor, so the full page loads instead of this modal
              intercepting the link again. */}
          <Button asChild>
            <a href={`/submission/${id}`}>
              <ExternalLink />
              Open full page
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
