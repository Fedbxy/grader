import { LucideIcon, Home, BookText, ListChecks } from "lucide-react";

export type NavConfig = {
    title: string;
    href: string;
    icon: IconName;
}

export type IconName =
    "Home" |
    "BookText" |
    "ListChecks";

export const iconMap: Record<IconName, LucideIcon> = {
    Home,
    BookText,
    ListChecks,
};

export const navConfig: NavConfig[] = [
    {
        title: "Home",
        href: "/",
        icon: "Home",
    },
    {
        title: "Problems",
        href: "/problemset",
        icon: "BookText",
    },
    {
        title: "Submissions",
        href: "/submission",
        icon: "ListChecks",
    },
]