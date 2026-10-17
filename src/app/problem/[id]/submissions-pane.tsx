"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SubmissionRow } from "@/types/submission";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Maximize2 } from "lucide-react";
import { SubmissionTable } from "@/components/submission/table";

type Scope = "mine" | "all";

// A problem's submissions, narrowed to the viewer's own with a switch: the
// workspace's Submissions tab and the problem's submissions page. Signed out
// there is nothing to narrow, so the switch is hidden and everyone's show.
export function SubmissionsPane({
  rows,
  viewerId,
  fullPageHref,
  isPaginationSaved = false,
}: {
  // Everything the viewer may see on this problem, theirs included.
  rows: SubmissionRow[];
  viewerId?: number;
  // In the workspace: the problem's full-width submissions page.
  fullPageHref?: string;
  // On a page of its own the page number goes in the URL, as on other lists.
  isPaginationSaved?: boolean;
}) {
  const mine = useMemo(
    () =>
      viewerId === undefined
        ? []
        : rows.filter((row) => row.user.id === viewerId),
    [rows, viewerId],
  );
  const [scope, setScope] = useState<Scope>(
    viewerId === undefined ? "all" : "mine",
  );

  return (
    <div className="flex flex-col gap-3">
      {(viewerId !== undefined || fullPageHref) && (
        <div className="flex min-h-7 items-center gap-3">
          {viewerId !== undefined && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={scope}
              // Radix sends "" when the pressed item is pressed again.
              onValueChange={(value) => value && setScope(value as Scope)}
              aria-label="Whose submissions to show"
            >
              <ToggleGroupItem value="mine" className="gap-1.5 px-3">
                Mine
                <span className="text-muted-foreground tabular-nums">
                  {mine.length}
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem value="all" className="gap-1.5 px-3">
                All
                <span className="text-muted-foreground tabular-nums">
                  {rows.length}
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          {fullPageHref && (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Named for where it goes, not what it lists: the switch's
                    All already lists every submission. */}
                <Button variant="ghost" size="sm" className="ml-auto" asChild>
                  <Link href={fullPageHref}>
                    <Maximize2 />
                    Full page
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open these submissions on their own page</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      {scope === "mine" && mine.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          You haven&apos;t submitted to this problem yet.
        </p>
      ) : (
        <SubmissionTable
          // A fresh table per scope, so the page resets to the first.
          key={scope}
          data={scope === "mine" ? mine : rows}
          // Every row is this problem; under Mine, every row is the viewer.
          columnVisibility={
            scope === "mine"
              ? { problem: false, user: false }
              : { problem: false }
          }
          isPaginationSaved={isPaginationSaved}
        />
      )}
    </div>
  );
}
