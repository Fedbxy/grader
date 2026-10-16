import type { Role } from "@/types/user";

import { AnnouncementSection } from "./announcement";
import { ContinueSection } from "./continue";
import { getHomeData } from "./data";
import { FirstRun } from "./first-run";
import { HomeHeader } from "./header";
import { JudgingStrip } from "./judging";
import { PointsSection } from "./points";
import { ProgressSection } from "./progress";
import { RecentSection } from "./recent";
import { UpNextSection } from "./up-next";

// The home page of a signed-in user. No card around the page, as on the
// profile: a header and the judging strip, then two columns from lg up (the
// wide one holds the tables); one on a phone, in the same order.
export async function Dashboard({ user }: { user: { id: number; role: Role; displayName: string } }) {
  const data = await getHomeData(user);

  if (!data.hasSubmissions) {
    return (
      <div className="container mx-auto flex max-w-3xl flex-col gap-6 py-10">
        <FirstRun displayName={user.displayName} problems={data.upNext} />
        <AnnouncementSection announcement={data.announcement} />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <HomeHeader
        displayName={user.displayName}
        judging={data.judgingCount}
        unfinished={data.points.problems}
      />
      {data.judging && (
        <JudgingStrip
          submissionId={data.judging.id}
          problemTitle={data.judging.problem.title}
          status={data.judging.status}
          testcases={data.judging.problem.testcases}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {data.continue && <ContinueSection data={data.continue} />}
          <PointsSection points={data.points} />
          <RecentSection recent={data.recent} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <ProgressSection progress={data.progress} userId={user.id} />
          <UpNextSection problems={data.upNext} />
          <AnnouncementSection announcement={data.announcement} />
        </div>
      </div>
    </div>
  );
}
