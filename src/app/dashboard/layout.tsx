import { NavigationTabs } from "./tabs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex flex-col space-y-2 py-10">
      <NavigationTabs />
      {children}
    </div>
  );
}
