"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navConfig, iconMap, IconName } from "@/config/nav";
import { cn } from "@/lib/shadcn";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation Menu</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter className="flex flex-col gap-2">
          {navConfig.map((item) => {
            const Icon = iconMap[item.icon as IconName];
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-colors hover:text-foreground/80",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/50",
                  )}
                >
                  <Icon className="mr-1 inline-block h-5 w-5" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
