"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/shadcn";

const sections = [
  { label: "Appearance", href: "/settings/appearance" },
  { label: "Account", href: "/settings/account" },
  { label: "Password", href: "/settings/password" },
];

// A column beside the content on a wide screen, a row of the same links above
// it on a phone, in three equal parts so all of them fit. Each section is its
// own URL, so it can be linked to and the back button steps between sections.
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="grid grid-cols-3 gap-1 md:flex md:flex-col"
    >
      {sections.map(({ label, href }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-2 text-center text-sm font-medium whitespace-nowrap transition-colors md:px-2.5 md:text-left",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
