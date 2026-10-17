import Link from "next/link";
import { getProblemData, getProblemSubmissions } from "@/utils/problem";

import { Button } from "@/components/ui/button";
import { ProblemHeader } from "../problem-header";
import { SubmissionsPane } from "../submissions-pane";
import { FileCode2 } from "lucide-react";

// The problem's submissions on a page of their own, for browsing without the
// editor (the problem list's menu and a rejudge land here). The workspace's
// Submissions tab lists the same rows beside the code. The id is checked by
// the layout.
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { problem, user } = await getProblemData(Number(params.id));
  const submissions = await getProblemSubmissions(problem.id, user);

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <ProblemHeader
        problem={problem}
        path={`/problem/${problem.id}/submission`}
        action={
          <Button size="sm" asChild>
            <Link href={`/problem/${problem.id}`}>
              <FileCode2 />
              View problem
            </Link>
          </Button>
        }
      />
      <SubmissionsPane
        rows={submissions}
        viewerId={user?.id}
        isPaginationSaved
      />
    </div>
  );
}
