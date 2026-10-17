import Link from "next/link";

import { RelativeTime } from "@/components/relative-time";
import { TEST_TONE } from "@/components/submission/test-tone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/shadcn";
import type { ContinueData } from "./data";
import { TONE_TEXT, limitsLine, verdictName, verdictTone } from "./format";
import { Score } from "./score";

// Where the viewer left off: the problem of their newest submission, when it
// is recent and still unsolved, and how its best attempt went. The rows and
// the test squares are the submission page's.
export function ContinueSection({ data }: { data: ContinueData }) {
  const { problem, subtasks, failure } = data;

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-lg font-semibold">Continue</h2>
      <div className="divide-y rounded-md border text-sm">
        <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="flex min-w-0 items-baseline gap-2">
              <span className="text-muted-foreground tabular-nums">#{problem.id}</span>
              <Link href={`/problem/${problem.id}`} className="link-underlined truncate font-medium">
                {problem.title}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              {limitsLine(problem)} · best of {data.attempts} · last touched <RelativeTime date={data.lastTouched} />
            </p>
          </div>
          <Score points={data.bestScore} total={problem.score} fraction={data.bestFraction} className="shrink-0" />
        </div>
        {subtasks.map((subtask, i) => (
          <div key={i} className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex items-center justify-between font-medium">
              Subtask {i + 1}
              <Badge
                className="text-nowrap"
                variant={subtask.earned >= subtask.full ? "constructive" : "destructive"}
              >
                {subtask.earned} / {subtask.full}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {subtask.verdicts.map((verdict, j) => {
                const test = subtask.firstTest + j;
                const detail = `Test ${test} · ${verdictName(verdict)}`;

                // The same numbered square as the submission page's grid, with
                // its tooltip (opens on tap too), the first failing test ringed.
                return (
                  <Tooltip key={j}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={detail}
                        className={cn(
                          "flex h-7 min-w-7 items-center justify-center rounded-md border px-1 text-xs font-medium tabular-nums",
                          TEST_TONE[verdict] ?? TEST_TONE.WA,
                          test === failure?.position && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                        )}
                      >
                        {test}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{detail}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
        {failure && (
          <p className="px-3 py-2 text-muted-foreground">
            Failed on test {failure.position} ·{" "}
            <span className={TONE_TEXT[verdictTone(failure.verdict) ?? "destructive"]}>{verdictName(failure.verdict)}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2 px-3 py-2.5">
          <Button size="sm" asChild>
            <Link href={`/problem/${problem.id}`}>Open problem</Link>
          </Button>
          {data.submissionId > 0 && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/submission/${data.submissionId}`}>Submission #{data.submissionId}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
