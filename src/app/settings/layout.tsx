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
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <aside className="flex flex-col gap-3 md:w-48 md:shrink-0">
          <SettingsNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
