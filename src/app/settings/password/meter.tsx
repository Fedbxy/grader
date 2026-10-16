"use client";

import { useState } from "react";
import { cn } from "@/lib/shadcn";

const SEGMENTS = 4;
const TONE = ["bg-destructive", "bg-destructive", "bg-warning", "bg-constructive", "bg-constructive"];
// The time one segment takes to fill or empty. A jump of several steps runs
// them one after another, each starting as the previous one ends, so the bar
// sweeps at one even speed.
const STEP_MS = 120;
const COLOUR_MS = 300;

// How long segment `i` waits before it moves, counted from the first segment
// that changes: the leftmost new one when growing, the rightmost lost one
// when shrinking. Segments that don't change don't wait.
function delay(i: number, from: number, to: number) {
    if (to > from && i >= from && i < to) return (i - from) * STEP_MS;
    if (to < from && i >= to && i < from) return (from - 1 - i) * STEP_MS;
    return 0;
}

// The password strength bar: `score` of four segments filled, in the colour
// of the score. It grows left to right and shrinks right to left; colours
// change together, at once. Nothing moves with reduced motion.
export function StrengthMeter({ score, label, typed }: { score: number; label: string; typed: boolean }) {
    // The score before this one, where a change starts from (state derived
    // from the previous render, as React recommends over an effect).
    const [shown, setShown] = useState({ score, from: score });
    if (shown.score !== score) setShown({ score, from: shown.score });

    return (
        <div
            role="meter"
            aria-label="Password strength"
            aria-valuemin={0}
            aria-valuemax={SEGMENTS}
            aria-valuenow={score}
            aria-valuetext={typed ? label : "Not entered"}
            className="grid grid-cols-4 gap-1"
        >
            {Array.from({ length: SEGMENTS }, (_, i) => (
                <div key={i} className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                        // Listed in the order of transition-property: scale, then colour.
                        style={{
                            transitionDuration: `${STEP_MS}ms, ${COLOUR_MS}ms`,
                            transitionDelay: `${delay(i, shown.from, score)}ms, 0ms`,
                            transitionTimingFunction: "linear, ease",
                        }}
                        className={cn(
                            "h-full origin-left rounded-full motion-safe:transition-[scale,background-color]",
                            i < score ? "scale-x-100" : "scale-x-0",
                            TONE[score],
                        )}
                    />
                </div>
            ))}
        </div>
    );
}
