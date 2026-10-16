import Link from "next/link";

import { RelativeTime } from "@/components/relative-time";
import type { HomeData } from "./data";
import { Score } from "./score";

// The unsolved problems with the most points still to win.
export function PointsSection({ points }: { points: HomeData["points"] }) {
  const { rows, problems } = points;

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="flex flex-wrap items-baseline gap-x-2 text-lg font-semibold">
        Unfinished
        {rows.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {problems}
          </span>
        )}
      </h2>
      {rows.length > 0 ? (
        <ul className="divide-y rounded-md border text-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="flex min-w-0 items-baseline gap-2">
                  <span className="text-muted-foreground tabular-nums">#{row.id}</span>
                  <Link href={`/problem/${row.id}/statement`} className="link-underlined truncate font-medium">
                    {row.title}
                  </Link>
                </p>
                {row.note && <p className="truncate text-xs text-muted-foreground">{row.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Score points={row.best} total={row.score} fraction={row.bestFraction} />
                <span className="font-medium tabular-nums">+{row.left}</span>
                {row.lastTry && (
                  <span className="ml-auto text-xs whitespace-nowrap text-muted-foreground sm:ml-0 sm:w-20 sm:text-right">
                    <RelativeTime date={row.lastTry} />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing half-done.</p>
      )}
    </section>
  );
}
