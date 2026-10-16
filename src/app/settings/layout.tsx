import { allowAccess } from "@/utils/access";

import { SettingsNav } from "./nav";

// A page header, then the sections listed down the left (across the top on a
// phone) and the chosen one beside them, with no box around either.
export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await allowAccess("user");

  return (
    // The sidebar and the section sit together in a centred block, as on
    // GitHub, rather than at the left of a wide page with the right empty.
    <div className="container mx-auto py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="flex flex-col gap-6 md:flex-row md:gap-10">
          <aside className="flex flex-col gap-3 md:w-48 md:shrink-0">
            <SettingsNav />
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
