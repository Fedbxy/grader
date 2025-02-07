"use client";

import Link from "next/link";
import { cn } from "@/lib/shadcn";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const tabs = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Announcements",
    href: "/dashboard/announcement",
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

export function NavigationTabs() {
  const pathname = usePathname();
  const currentTab = tabs.find(
    (tab) => tab.href.split("/")[2] === pathname.split("/")[2],
  );

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="md:hidden">
            Menu
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Dashboard Navigation</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="flex flex-col gap-2">
            {tabs.map((tab, index) => (
              <Link key={index} href={tab.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-colors hover:text-foreground/80",
                    currentTab === tab
                      ? "text-foreground"
                      : "text-foreground/50",
                  )}
                >
                  {tab.label}
                </Button>
              </Link>
            ))}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Tabs defaultValue={currentTab?.href} className="hidden md:flex">
        <TabsList>
          {tabs.map((tab, index) => (
            <Link key={index} href={tab.href}>
              <TabsTrigger value={tab.href}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
