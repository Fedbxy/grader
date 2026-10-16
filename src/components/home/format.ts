import { maps } from "@/config/messages";

// "1.000s · 256MB", as a problem's limits read on the home page.
export function limitsLine({ timeLimit, memoryLimit }: { timeLimit: number; memoryLimit: number }) {
  return `${(timeLimit / 1000).toFixed(3)}s · ${memoryLimit}MB`;
}

export type Tone = "constructive" | "warning" | "destructive";

// Written out rather than interpolated: Tailwind only emits classes it can
// see as complete strings in the source. The same colours as the score cell
// and the problem list: green solved, amber partial, red nothing.
export const TONE_TEXT: Record<Tone, string> = {
  constructive: "text-constructive dark:text-green-400",
  warning: "text-warning dark:text-amber-400",
  destructive: "text-destructive",
};

export const TONE_FILL: Record<Tone, string> = {
  constructive: "bg-constructive",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

// The colour of a share of a problem's score (0 to 1).
export function fractionTone(fraction: number): Tone {
  return fraction >= 1 ? "constructive" : fraction > 0 ? "warning" : "destructive";
}

// The colour of one testcase's verdict in the grid.
export function verdictTone(verdict: string): Tone | null {
  if (verdict === "AC") return "constructive";
  if (verdict === "TLE" || verdict === "MLE") return "warning";
  if (verdict === "SKP") return null;
  return "destructive";
}

export function verdictName(verdict: string) {
  return maps.submission.verdict[verdict as keyof typeof maps.submission.verdict] ?? verdict;
}

// The small label under a problem's name: how the latest try went.
export function lastTryNote(verdict: { code: string; position?: number }) {
  if (verdict.code === "running") return "last: judging";
  if (verdict.code === "CE" || verdict.code === "JE" || verdict.code === "SE") {
    return `last: ${verdictName(verdict.code).toLowerCase()}`;
  }
  const name = verdictName(verdict.code);
  return verdict.position ? `${name} on test ${verdict.position}` : name;
}
