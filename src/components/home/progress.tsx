import Link from "next/link";

import type { HomeData } from "./data";
import { TONE_FILL } from "./format";

// Solved, partial, failed and untried problems as the profile's stat strip,
// the same counts as one stacked bar, and how often the viewer's judged
// submissions were accepted.
export function ProgressSection({ progress, userId }: { progress: HomeData["progress"]; userId: number }) {
  const { solved, partial, failed, untried, total, acceptance } = progress;
  const tiles = [
    { label: "Solved", value: solved, fill: TONE_FILL.constructive },
    { label: "Partial", value: partial, fill: TONE_FILL.warning },
    { label: "Failed", value: failed, fill: TONE_FILL.destructive },
    { label: "Untried", value: untried, fill: "bg-muted-foreground/30" },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Progress</h2>
        <Link href={`/user/${userId}/profile`} className="link-underlined text-sm">
          Your profile
        </Link>
      </div>
      <div className="grid grid-cols-4 divide-x rounded-md border">
        {tiles.map((tile) => (
          <div key={tile.label} className="px-1 py-3 text-center">
            <p className="text-2xl font-semibold tabular-nums">{tile.value}</p>
            <p className="text-xs text-muted-foreground">{tile.label}</p>
          </div>
        ))}
      </div>
      <div
        className="flex h-2 gap-px overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${solved} of ${total} problems solved`}
      >
        {tiles.map(
          (tile) =>
            tile.value > 0 && (
              <span key={tile.label} className={tile.fill} style={{ flexGrow: tile.value, flexBasis: 0 }} />
            ),
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {acceptance === null ? "No judged submissions yet." : `${acceptance}% of your judged submissions were accepted.`}
      </p>
    </section>
  );
}
