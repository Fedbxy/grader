import Link from "next/link";

import { LocalTime } from "@/components/local-time";
import type { HomeData } from "./data";

// The newest public announcement; nothing at all when there is none.
export function AnnouncementSection({ announcement }: { announcement: HomeData["announcement"] }) {
  if (!announcement) {
    return null;
  }

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="text-lg font-semibold">Announcement</h2>
      <div className="flex flex-col gap-1 rounded-md border px-3 py-2.5 text-sm">
        <Link href={`/announcement/${announcement.id}`} className="link-underlined w-fit max-w-full font-medium break-words">
          {announcement.title}
        </Link>
        {announcement.excerpt && <p className="line-clamp-2 text-muted-foreground">{announcement.excerpt}</p>}
        <p className="text-xs text-muted-foreground">
          {announcement.author} · <LocalTime date={announcement.updatedAt} />
        </p>
      </div>
    </section>
  );
}
