import Link from "next/link";
import { ProblemData } from "@/utils/problem";

import { Button } from "@/components/ui/button";
import { Path } from "@/components/path";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, Download, MemoryStick, Trophy } from "lucide-react";

// The problem's header, shared by the workspace and the problem's
// submissions page: breadcrumb, title and author on the left, the limits and
// Download PDF on the right, plus an optional button of the page's own.
export function ProblemHeader({
  problem,
  path,
  action,
  className,
}: {
  problem: ProblemData["problem"];
  // Where the breadcrumb ends, e.g. /problem/12/submission.
  path: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${className ?? ""}`}
    >
      <div className="min-w-0 space-y-1.5">
        <Path path={path} />
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {problem.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            by{" "}
            <Link
              href={`/user/${problem.author.id}/profile`}
              className="link-underlined"
            >
              {problem.author.displayName}
            </Link>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <Limit icon={<Clock />} label="Time limit">
          {problem.timeLimit / 1000}{" "}
          {problem.timeLimit === 1000 ? "second" : "seconds"}
        </Limit>
        <Limit icon={<MemoryStick />} label="Memory limit">
          {problem.memoryLimit} MB
        </Limit>
        <Limit icon={<Trophy />} label="Points for solving every test">
          {problem.score} pts
        </Limit>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/api/problem/${problem.id}/statement`}
                  target="_blank"
                  aria-label="Download PDF"
                >
                  <Download />
                  {/* Icon only on phones, so it stays on the limits' line. */}
                  <span className="hidden sm:inline">Download PDF</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download the statement as a PDF</p>
            </TooltipContent>
          </Tooltip>
          {action}
        </div>
      </div>
    </header>
  );
}

// One of the header's limits, with a tooltip naming it: the icon alone
// doesn't say "limit".
function Limit({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="flex items-center gap-1.5 [&_svg]:size-4"
        >
          {icon}
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
