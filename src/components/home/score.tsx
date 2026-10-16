import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/shadcn";
import { TONE_TEXT, fractionTone } from "./format";

// A score as the score cell shows it: the points over the problem's score in
// the verdict's colour, with a bar under them.
export function Score({
  points,
  total,
  fraction,
  className,
}: {
  points: number;
  total: number;
  fraction: number;
  className?: string;
}) {
  const tone = fractionTone(fraction);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("whitespace-nowrap", TONE_TEXT[tone])}>
        {points} / {total}
      </span>
      <Progress className="h-2 w-16 md:w-32" variant={tone} value={fraction * 100} />
    </div>
  );
}
