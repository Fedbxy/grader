import Link from "next/link";
import { siteConfig } from "@/config/site";
import { validateRequest } from "@/lib/auth";

import { MainNav } from "@/components/nav/main";
import { MobileNav } from "@/components/nav/mobile";
import { UserNav } from "@/components/nav/user";
import { ThemeSwitcher } from "@/components/theme/switcher";

export async function Header() {
    const { user } = await validateRequest();

    const titleLink = user?.role === "admin" ? "/dashboard" : "/";

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
            <div className="container flex h-header max-w-(--breakpoint-2xl) items-center">
                <div className="mr-6 flex items-center [&>*+*]:ml-2">
                    <MobileNav />
                    <Link href={titleLink}>
                        <span className="font-bold">
                            {siteConfig.name}
                        </span>
                    </Link>
                </div>
                <MainNav />
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ThemeSwitcher />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}