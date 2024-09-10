import Link from "next/link";

import { Button } from "@/components/ui/button";

const tabs = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Users",
    href: "/dashboard/user",
  },
  {
    label: "Problems",
    href: "/dashboard/problem",
  },
  {
    label: "Submissions",
    href: "/dashboard/submission",
  },
];

export function NavigationTabs({ page }: { page: string }) {
  return (
    <div className="flex space-x-8 overflow-x-auto">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href}>
          <Button
            variant={page === tab.label.toLowerCase() ? "default" : "secondary"}
            size="sm"
          >
            {tab.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
