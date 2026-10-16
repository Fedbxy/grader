// A test's square in the grid: green passed, red wrong or crashed, amber over
// a limit, dashed grey skipped.
export const TEST_TONE: Record<string, string> = {
  AC: "border-constructive/40 bg-constructive/15 text-constructive dark:text-green-400",
  WA: "border-destructive/40 bg-destructive/15 text-destructive",
  RE: "border-destructive/40 bg-destructive/15 text-destructive",
  TLE: "border-warning/40 bg-warning/15 text-warning dark:text-amber-400",
  MLE: "border-warning/40 bg-warning/15 text-warning dark:text-amber-400",
  SKP: "border-dashed border-muted-foreground/40 text-muted-foreground",
};
