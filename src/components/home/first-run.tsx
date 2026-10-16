import type { UpNextProblem } from "@/utils/accepted";
import { UpNextSection } from "./up-next";

// What a viewer with no submissions sees in place of their own progress.
export function FirstRun({ displayName, problems }: { displayName: string; problems: UpNextProblem[] }) {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold break-words">Welcome, {displayName}</h1>
        <p className="text-sm text-muted-foreground">
          Let&apos;s get your first verdict. Your home page fills in as you submit.
        </p>
      </header>
      <UpNextSection problems={problems} title="Good first problems" bars />
    </>
  );
}
