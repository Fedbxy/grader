import { LucideIcon, Home, BookText, FileUp, ListChecks } from "lucide-react";

export type NavConfig = {
    title: string;
    href: string;
    icon: IconName;
}

export type IconName =
    "Home" |
    "BookText" |
    "FileUp" |
    "ListChecks";

export const iconMap: Record<IconName, LucideIcon> = {
    Home,
    BookText,
    FileUp,
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
        href: "/problem",
        icon: "BookText",
    },
    {
        title: "Submit",
        href: "/submit",
        icon: "FileUp",
    },
    {
        title: "Submissions",
        href: "/submission",
        icon: "ListChecks",
    },
]