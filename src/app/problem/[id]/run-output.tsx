"use client";

import { maps } from "@/config/messages";
import { limits } from "@/config/limits";
import { RunResult } from "@/types/run";

import { Badge } from "@/components/ui/badge";
import { TruncatedText } from "@/components/truncated-text";
import { Kbd } from "@/components/ui/kbd";
import { LoadingSpinner } from "@/components/ui/spinner";

const VERDICTS = maps.submission.verdict;

// Kilobytes from the judge; megabytes once there are enough of them to read.
function formatMemory(kb: number) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function formatStats(run: RunResult) {
  return [
    run.time !== null && `${run.time} ms`,
    run.memory !== null && formatMemory(run.memory),
  ].filter(Boolean);
}

// How a finished run ended, e.g. "Runtime Error · exit code 1".
function endedWith(run: RunResult) {
  if (run.verdict === "RE") {
    if (run.exitSignal !== null) return `signal ${run.exitSignal}`;
    if (run.exitCode !== null) return `exit code ${run.exitCode}`;
  }
  return null;
}

// The one line shown on the bar next to the Run button.
export function runSummary(
  run: RunResult | undefined,
  { starting, expired }: { starting: boolean; expired: boolean },
) {
  if (starting) return "Starting…";
  if (expired) return "This run has expired.";
  if (!run) return null;
  if (run.status !== null) return `${run.status}…`;
  if (run.errorCode) return VERDICTS[run.errorCode];
  if (!run.verdict) return VERDICTS.JE;
  return [
    run.verdict === "OK" ? "Finished" : VERDICTS[run.verdict],
    endedWith(run),
    ...formatStats(run),
  ]
    .filter(Boolean)
    .join(" · ");
}

type RunProps = {
  runId: number | null;
  run: RunResult | undefined;
  starting: boolean;
  expired: boolean;
};

function isPending({ runId, run, starting }: RunProps) {
  return starting || (runId !== null && (!run || run.status !== null));
}

// How the run went, at the right of the Output header.
export function RunStatus(props: RunProps) {
  const { run, expired } = props;

  if (expired) {
    return <span className="ml-auto text-xs text-muted-foreground">Expired</span>;
  }

  if (isPending(props)) {
    return (
      <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <LoadingSpinner size={12} />
        {run?.status ?? "In queue"}
      </span>
    );
  }

  if (!run) {
    return null;
  }

  // A compile error is the user's; anything else without a verdict is the
  // judge's.
  if (run.errorCode === "CE") {
    return (
      <Badge className="ml-auto bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
        {VERDICTS.CE}
      </Badge>
    );
  }

  if (run.errorCode || !run.verdict) {
    return (
      <Badge variant="secondary" className="ml-auto">
        {VERDICTS[run.errorCode ?? "JE"]}
      </Badge>
    );
  }

  return (
    // flex-1: takes all the header's room after the "Output" label (which
    // never shrinks), so the badge's max-width below has a width to resolve.
    <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
      {/* Always beside the badge, and strictly first to give way: it shrinks
          while the badge cannot (shrink-0), down to "…" (min-w-4). Whichever
          is cut shows in full in a tooltip. */}
      <TruncatedText
        text={formatStats(run).join(" · ")}
        className="min-w-4 text-xs text-muted-foreground tabular-nums"
      />
      {/* Only cut once the time and memory are down to "…": the badge may
          never take the room those (1rem) and the gap (0.5rem) need. */}
      <Badge
        variant={run.verdict === "OK" ? "constructive" : "destructive"}
        className="max-w-[calc(100%-1.5rem)]"
      >
        <TruncatedText
          text={run.verdict === "OK" ? "Finished" : VERDICTS[run.verdict]}
          className="min-w-4"
        />
      </Badge>
    </span>
  );
}

// What the program printed, or why there is nothing to show.
export function RunOutput({
  shortcutHint,
  ...props
}: RunProps & { shortcutHint: string }) {
  const { run, expired } = props;

  if (expired) {
    return <Hint>This run has expired. Run again to see the output.</Hint>;
  }

  if (isPending(props)) {
    return <Hint>Waiting for the judge…</Hint>;
  }

  if (!run) {
    return (
      <Hint>
        Run your code to see its output here.
        <span className="flex items-center gap-1.5">
          Press <Kbd>{shortcutHint}</Kbd> from anywhere.
        </span>
      </Hint>
    );
  }

  if (run.errorCode === "CE") {
    return run.error ? <Stream text={run.error} truncated={false} /> : null;
  }

  if (run.errorCode || !run.verdict) {
    return <Hint>Something went wrong on the judge. Try again.</Hint>;
  }

  return (
    <>
      {/* How it ended, e.g. "exit code 3": part of the result, so it sits
          with the output rather than with the measurements. */}
      {endedWith(run) && (
        <p className="px-3 pt-2 text-xs text-muted-foreground tabular-nums">
          {endedWith(run)}
        </p>
      )}
      <Stream text={run.stdout} truncated={run.stdoutTruncated} empty="No output." />
      {run.stderr && (
        <div className="border-t">
          <p className="px-3 pt-2 text-xs font-medium text-muted-foreground">
            stderr
          </p>
          <Stream
            text={run.stderr}
            truncated={run.stderrTruncated}
            className="text-muted-foreground"
          />
        </div>
      )}
    </>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Stream({
  text,
  truncated,
  empty,
  className,
}: {
  text: string | null;
  truncated: boolean;
  empty?: string;
  className?: string;
}) {
  return (
    <>
      {/* Above the text: below 64 KB of output it would never be seen. */}
      {truncated && (
        <p className="px-3 pt-2 text-xs text-muted-foreground">
          Output cut off at {limits.run.output / 1024} KB.
        </p>
      )}
      {text ? (
        <pre
          className={`px-3 py-2 font-mono text-sm leading-relaxed whitespace-pre ${className ?? ""}`}
        >
          {text}
        </pre>
      ) : (
        empty && (
          <p className="px-3 py-2 text-sm text-muted-foreground italic">{empty}</p>
        )
      )}
    </>
  );
}
