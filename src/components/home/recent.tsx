
import { SubmissionTable } from "@/components/submission/table";
import type { HomeData } from "./data";

// The viewer's last few submissions in the shared table, as on the profile;
// the whole list lives on /submission/my.
export function RecentSection({ recent }: { recent: HomeData["recent"] }) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Recent submissions</h2>
        {/* A plain link, not next/link: a client-side move to /submission/my
            is caught by the submission modal's intercepting route. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see above */}
        <a href="/submission/my" className="link-underlined text-sm">
          View all
        </a>
      </div>
      <SubmissionTable
        data={recent}
        columnVisibility={{ user: false, time: false, memory: false }}
        isPaginationSaved={false}
      />
    </section>
  );
}
