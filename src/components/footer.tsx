import Link from "next/link";
import { siteConfig } from "@/config/site";

import { Heart } from "lucide-react";

export function Footer() {
    // The problem workspace fills the window, so it marks itself with
    // data-workspace and the footer hides while it is on the page.
    return (
        <footer className="bg-background/95 border-t [body:has([data-workspace])_&]:hidden">
            <div className="container h-footer max-w-(--breakpoint-2xl) flex items-center justify-between">
                <span className="text-sm text-text/50">
                    &copy; 2024 {siteConfig.name}
                </span>
                <span className="text-sm text-text/50">
                    Built with <Heart strokeWidth={0} fill="red" className="inline h-4 w-4" /> by {" "}
                    <Link href={siteConfig.links.github} className="underline link">
                        {siteConfig.creator}
                    </Link>
                </span>
            </div>
        </footer>
    );
}