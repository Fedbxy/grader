import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import type { UpNextProblem } from "@/utils/accepted";
import { limitsLine } from "./format";

// Problems the viewer never tried, the easiest first. With `bars` the solve
// rate is drawn as a bar too (the first-run page).
export function UpNextSection({
  problems,
  title = "Up next",
  bars = false,
}: {
  problems: UpNextProblem[];
  title?: string;
  bars?: boolean;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {problems.length > 0 ? (
        <ul className="divide-y rounded-md border text-sm">
          {problems.map((problem) => (
            <li key={problem.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="flex min-w-0 items-baseline gap-2">
                  <span className="text-muted-foreground tabular-nums">#{problem.id}</span>
                  <Link href={`/problem/${problem.id}`} className="link-underlined truncate font-medium">
                    {problem.title}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">{limitsLine(problem)}</p>
              </div>
              {bars && problem.solveRate !== null && (
                <Progress value={problem.solveRate} variant="constructive" className="hidden h-2 w-24 sm:flex" />
              )}
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {problem.solveRate === null ? "new" : `${problem.solveRate}% solve`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          You&apos;ve tried everything.{" "}
          <Link href="/problem" className="link-underlined">
            Problems
          </Link>
        </p>
      )}
    </section>
  );
}
