"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navConfig, iconMap, IconName } from "@/config/nav";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
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
                <div className="mx-auto w-full max-w-md">
                    <div className="p-4 grid gap-6 text-lg font-medium">
                        {navConfig.map((item) => {
                            const Icon = iconMap[item.icon as IconName];
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "transition-colors hover:text-foreground/80",
                                        pathname === item.href ? "text-foreground" : "text-foreground/60"
                                    )}
                                >
                                    <Icon className="inline-block h-6 w-6 mr-2" />
                                    {item.title}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}