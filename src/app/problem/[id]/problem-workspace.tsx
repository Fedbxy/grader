import { getProblemData, getProblemSubmissions } from "@/utils/problem";
import { getLastRun } from "@/utils/run";

import { ProblemHeader } from "./problem-header";
import { SubmissionsPane } from "./submissions-pane";
import { Workspace } from "./workspace";

// The problem page: a header, then the statement and submissions beside
// the editor. It fills the window under the app header; the footer hides
// while data-workspace is on the page.
export async function ProblemWorkspace({ id }: { id: number }) {
  const { problem, user, latestCode, latestLanguage } =
    await getProblemData(id);

  const submissions = await getProblemSubmissions(problem.id, user);

  const initialRun = user ? await getLastRun(user.id, problem.id) : undefined;

  return (
    <div
      data-workspace
      className="flex h-[calc(100dvh-var(--spacing-header)-1px)] flex-col"
    >
      <ProblemHeader
        problem={problem}
        path={`/problem/${problem.id}`}
        className="px-4 pt-4 pb-3 md:px-6"
      />
      <Workspace
        problemId={problem.id}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
        latestCode={latestCode}
        latestLanguage={latestLanguage}
        disabled={!user}
        initialRun={initialRun}
        viewerId={user?.id}
        submissions={
          <SubmissionsPane
            rows={submissions}
            viewerId={user?.id}
            fullPageHref={`/problem/${problem.id}/submission`}
          />
        }
      />
    </div>
  );
}
