"use client";

import { maps } from "@/config/messages";
import { useIsClient } from "@/hooks/is-client";
import { useLocalStorage } from "@/hooks/local-storage";
import { useSubmission } from "@/hooks/submission";
import Decimal from "decimal.js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileWarning, ServerCrash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// The view most people see; Settings → Appearance can pick another.
export const DEFAULT_VERDICT_STYLE = "grid";

/**
 * Convert a subtask's passed-case count into displayed points.
 *
 * result.scores[i] is a count of cases, not points: the weighting lives here so
 * that changing a problem's max score never requires a rejudge. Rounded once,
 * at the end — rounding subtaskFullScore first and then multiplying by it
 * compounds the error.
 */
function subtaskDisplay(
  passed: number,
  caseCount: number,
  subtaskWeight: number,
  totalWeight: number,
  problemScore: number,
) {
  const full = new Decimal(subtaskWeight).div(totalWeight).mul(problemScore);
  const earned = new Decimal(passed).div(caseCount || 1).mul(full);

  return {
    subtaskScore: earned.toDecimalPlaces(2).toNumber(),
    subtaskFullScore: full.toDecimalPlaces(2).toNumber(),
  };
}

export function Verdict({
  submissionId,
  testcases,
  problemScore,
  openSubtasks = "none",
  compact = false,
}: {
  submissionId: number;
  testcases: number;
  problemScore: number;
  // Which subtasks start open: none, only the first one that lost points, or
  // every one that lost points. A subtask is failing when it scored below its
  // full score.
  openSubtasks?: "none" | "first-failing" | "failing";
  // Shorter column headers, for narrow places such as a phone.
  compact?: boolean;
}) {
  const [verdictStyle, setVerdictStyle] = useLocalStorage(
    "verdictStyle",
    DEFAULT_VERDICT_STYLE,
  );
  const isClient = useIsClient();

  const {
    data,
    isLoading: isSubmissionLoading,
    isRunning,
  } = useSubmission(submissionId);

  if (!isClient || isSubmissionLoading) {
    return <Skeleton className="h-96 rounded-md" />;
  }

  const { result, status, errorCode, error } = data;
  const scores = result.scores;
  const verdicts = result.verdicts;
  const times = result.times;
  const memories = result.memories;
  const weights = result.weights;
  const weight =
    weights?.reduce((a: number, b: number) => a + b, 0) || testcases;

  if (isRunning) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center p-4">
          <LoadingSpinner className="mr-2 h-5 w-5" />
          {status}
        </div>
      </div>
    );
  }

  if (errorCode) {
    return <ErrorPanel errorCode={errorCode} error={error} />;
  }

  const failing: number[] = (verdicts ?? []).flatMap(
    (subtask_verdicts: string[], subtask: number) => {
      const { subtaskScore, subtaskFullScore } = subtaskDisplay(
        scores[subtask], subtask_verdicts.length, weights?.[subtask] ?? 1, weight, problemScore,
      );

      return subtaskScore < subtaskFullScore ? [subtask] : [];
    },
  );
  const opened =
    openSubtasks === "failing"
      ? failing
      : openSubtasks === "first-failing"
        ? failing.slice(0, 1)
        : [];

  // Tests are numbered across the whole submission, as the verdict names them
  // ("Runtime Error · test 4"): the first test of each subtask starts after
  // the previous subtask's last.
  const firstNumber: number[] = [];
  (verdicts ?? []).reduce((next: number, subtask_verdicts: string[], subtask: number) => {
    firstNumber[subtask] = next;
    return next + subtask_verdicts.length;
  }, 1);
  const firstFailing = (() => {
    for (const [subtask, subtask_verdicts] of ((verdicts ?? []) as string[][]).entries()) {
      const i = subtask_verdicts.findIndex((v) => v !== "AC" && v !== "SKP");
      if (i !== -1) return firstNumber[subtask] + i;
    }
    return null;
  })();

  const table = (
    <Accordion
      type="multiple"
      defaultValue={opened.map((subtask) => `subtask-${subtask}`)}
    >
      {verdicts?.map((subtask_verdicts: string[], subtask: number) => {
        const { subtaskScore, subtaskFullScore } = subtaskDisplay(
          scores[subtask], subtask_verdicts.length, weights?.[subtask] ?? 1, weight, problemScore,
        );

        return (
            <AccordionItem key={subtask} value={`subtask-${subtask}`}>
              <AccordionTrigger>
                <span className="flex w-full items-center justify-between">
                  Subtask {subtask + 1}
                  <Badge
                    className="mr-2 text-nowrap"
                    variant={`${subtaskScore === subtaskFullScore ? "constructive" : "destructive"}`}
                  >
                    {subtaskScore} / {subtaskFullScore}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={compact ? "w-10" : "w-[100px]"}>#</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead className="text-nowrap text-right">
                        {compact ? "Time" : "Execution Time"}
                      </TableHead>
                      <TableHead className="text-nowrap text-right">
                        {compact ? "Memory" : "Memory Used"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subtask_verdicts.map((v: string, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{firstNumber[subtask] + i}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              v === "AC" ? "constructive" : "destructive"
                            }
                            className="text-nowrap capitalize"
                          >
                            {
                              maps.submission.verdict[
                                v as keyof typeof maps.submission.verdict
                              ]
                            }
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {times[subtask][i]} ms
                        </TableCell>
                        <TableCell className="text-right">
                          {memories[subtask][i]} KB
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
        );
      })}
    </Accordion>
  );

  const classic = (
    <div className="flex flex-col overflow-x-auto rounded-lg border bg-secondary p-4">
      {verdicts?.map((subtask_verdicts: string[], subtask: number) => {
        const { subtaskScore, subtaskFullScore } = subtaskDisplay(
          scores[subtask], subtask_verdicts.length, weights?.[subtask] ?? 1, weight, problemScore,
        );

        return (
          <div key={subtask} className="mb-4">
            <h3
              className={
                "mb-2 text-lg font-semibold" +
                (subtaskScore === subtaskFullScore
                  ? " text-constructive"
                  : " text-destructive")
              }
            >
              Subtask {subtask + 1} ({subtaskScore}/{subtaskFullScore})
            </h3>
            {subtask_verdicts.map((v: string, i: number) => (
              <pre
                className={`${
                  v === "AC" ? "text-constructive" : "text-destructive"
                }`}
                key={i}
              >
                #{i + 1}{" "}
                {
                  maps.submission.verdict[
                    v as keyof typeof maps.submission.verdict
                  ]
                }{" "}
                ({times[subtask][i]}ms, {memories[subtask][i]}KB)
              </pre>
            ))}
          </div>
        );
      })}
    </div>
  );

  const grid = (
    <div className="flex flex-col divide-y">
      {verdicts?.map((subtask_verdicts: string[], subtask: number) => {
        const { subtaskScore, subtaskFullScore } = subtaskDisplay(
          scores[subtask], subtask_verdicts.length, weights?.[subtask] ?? 1, weight, problemScore,
        );

        return (
          <div key={subtask} className="flex flex-col gap-2 py-3 first:pt-0">
            <div className="flex items-center justify-between text-sm font-medium">
              Subtask {subtask + 1}
              <Badge
                className="text-nowrap"
                variant={subtaskScore === subtaskFullScore ? "constructive" : "destructive"}
              >
                {subtaskScore} / {subtaskFullScore}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {subtask_verdicts.map((v: string, i: number) => {
                const number = firstNumber[subtask] + i;
                const name =
                  maps.submission.verdict[v as keyof typeof maps.submission.verdict] ?? v;
                const detail =
                  v === "SKP"
                    ? `Test ${number} · ${name}`
                    : `Test ${number} · ${name} · ${times[subtask][i]} ms · ${memories[subtask][i]} KB`;

                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={detail}
                        className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-1 text-xs font-medium tabular-nums ${TEST_TONE[v] ?? TEST_TONE.WA} ${number === firstFailing ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : ""}`}
                      >
                        {number}
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
        );
      })}
      <p className="flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs text-muted-foreground">
        {LEGEND.map(({ code, label }) => (
          <span key={code} className="flex items-center gap-1">
            <span className={`inline-block size-3 rounded-sm border ${TEST_TONE[code]}`} />
            {label}
          </span>
        ))}
      </p>
    </div>
  );

  const view =
    verdictStyle === "classic" ? classic : verdictStyle === "table" ? table : grid;

  // Grid and table can swap in place; the choice is remembered like the
  // setting.
  if (verdictStyle === "classic") {
    return view;
  }

  return (
    <div className="flex flex-col gap-2">
      {view}
      <Button
        variant="link"
        size="sm"
        className="h-auto self-start p-0 text-muted-foreground"
        onClick={() => setVerdictStyle(verdictStyle === "table" ? "grid" : "table")}
      >
        {verdictStyle === "table" ? "Show as grid" : "Show as table"}
      </Button>
    </div>
  );
}

// A test's square in the grid: green passed, red wrong or crashed, amber over
// a limit, dashed grey skipped.
const TEST_TONE: Record<string, string> = {
  AC: "border-constructive/40 bg-constructive/15 text-constructive dark:text-green-400",
  WA: "border-destructive/40 bg-destructive/15 text-destructive",
  RE: "border-destructive/40 bg-destructive/15 text-destructive",
  TLE: "border-warning/40 bg-warning/15 text-warning dark:text-amber-400",
  MLE: "border-warning/40 bg-warning/15 text-warning dark:text-amber-400",
  SKP: "border-dashed border-muted-foreground/40 text-muted-foreground",
};

const LEGEND = [
  { code: "AC", label: "Passed" },
  { code: "WA", label: "Wrong or crashed" },
  { code: "TLE", label: "Over a limit" },
  { code: "SKP", label: "Skipped" },
];

// What each submission-wide error means and what to do about it. A compile
// error is the submitter's to fix; the other two are not their fault. Worded
// for any viewer, not only the submitter.
const ERRORS: Record<
  string,
  { icon: typeof FileWarning; tone: string; explain: string }
> = {
  CE: {
    icon: FileWarning,
    tone: "text-amber-600 dark:text-amber-400",
    explain:
      "The code didn't compile, so no tests ran. The compiler's message is below; fix it and submit again.",
  },
  JE: {
    icon: ServerCrash,
    tone: "text-muted-foreground",
    explain:
      "The judge couldn't grade this submission because of a problem with the problem's setup, not the code. An admin needs to fix it.",
  },
  SE: {
    icon: ServerCrash,
    tone: "text-muted-foreground",
    explain:
      "Something went wrong in the grading system, not in the code. Submitting again later should work.",
  },
};

// A submission that failed as a whole: which error, what it means, and the
// message itself, all shown without a click.
function ErrorPanel({
  errorCode,
  error,
}: {
  errorCode: string;
  error?: string | null;
}) {
  const { icon: Icon, tone, explain } = ERRORS[errorCode] ?? ERRORS.SE;
  const label =
    maps.submission.verdict[errorCode as keyof typeof maps.submission.verdict] ??
    errorCode;

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className={`flex items-center gap-1.5 font-medium ${tone}`}>
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <p className="text-sm text-muted-foreground">{explain}</p>
      </div>
      {error && (
        <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
          {error}
        </pre>
      )}
    </div>
  );
}
