import { NavigationTabs } from "./tabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-2 px-4 py-4 md:px-12 md:py-8">
      <NavigationTabs />
      {children}
    </div>
  );
}
