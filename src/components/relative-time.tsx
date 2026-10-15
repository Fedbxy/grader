"use client";

import { useIsClient } from "@/hooks/is-client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

// "2 weeks ago", "yesterday", "now": the largest unit that fits, rounded. In
// English, since it sits inside English sentences.
function relative(date: Date) {
  const seconds = (date.getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.round(seconds / size), unit);
    }
  }

  return format.format(0, "second");
}

// A time relative to now, with the exact local date and time in a tooltip.
// Both depend on the viewer's clock and timezone, so it renders in the browser
// only.
export function RelativeTime({ date }: { date: string }) {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={date} tabIndex={0} className="cursor-default">
          {relative(new Date(date))}
        </time>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {new Date(date).toLocaleString(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
