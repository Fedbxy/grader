"use client";

import { useIsClient } from "@/hooks/is-client";

function greeting(hour: number) {
  return hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
}

// "Fri 16 Oct", in the viewer's timezone.
function dateLine(now: Date) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(now);
}

// The greeting and what is going on. Both the date and the part of the day
// depend on the viewer's clock, so they render in the browser only; the
// server's HTML has a stable greeting and no date.
export function HomeHeader({
  displayName,
  judging,
  unfinished,
}: {
  displayName: string;
  judging: number;
  unfinished: number;
}) {
  const isClient = useIsClient();
  const now = new Date();
  const line = [
    isClient && dateLine(now),
    judging > 0 && `${judging} judging`,
    // Problems, not points: each problem's points are its author's choice, so
    // a sum across problems would say little.
    unfinished > 0 && `${unfinished} ${unfinished === 1 ? "problem" : "problems"} unfinished`,
  ].filter(Boolean);

  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold break-words">
        {isClient ? `${greeting(now.getHours())}, ${displayName}.` : `Welcome back, ${displayName}.`}
      </h1>
      {line.length > 0 && <p className="text-sm text-muted-foreground">{line.join(" · ")}</p>}
    </header>
  );
}
