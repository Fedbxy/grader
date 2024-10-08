"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navConfig } from "@/config/nav";
import { cn } from "@/lib/shadcn";

export function MainNav() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex mr-4">
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
                {navConfig.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "transition-colors hover:text-primary/80",
                            pathname === item.href ? "text-primary font-semibold" : "text-foreground/60"
                        )}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
        </div>
    );
}

// TODO: use shadcn nav menu