"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/shadcn";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// One line of text that ends in "…" when it doesn't fit, and only then has a
// tooltip with all of it. Watches its own width, so dragging a pane wider or
// narrower turns the tooltip on and off.
export function TruncatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    // Not scrollWidth > clientWidth: both are rounded to whole pixels, so text
    // cut by less than one (127.4px of text in a 126.8px box) reads as
    // fitting while the browser still draws the "…". A range measures the
    // text itself, fractions included.
    const check = () => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const textWidth = range.getBoundingClientRect().width;
      setIsTruncated(textWidth > element.getBoundingClientRect().width + 0.01);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    // Always rendered, forced shut while the text fits: swapping the tooltip
    // in and out would remount the span this watches. Not hoverable, so a
    // neighbour's tooltip opens straight away rather than waiting for the
    // pointer to leave this one's path.
    <Tooltip open={isTruncated ? undefined : false} disableHoverableContent>
      <TooltipTrigger asChild>
        <span ref={ref} className={cn("min-w-0 truncate", className)}>
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
