import Link from "next/link";
import { siteConfig } from "@/config/site";

import { Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background/95 border-t">
            <div className="container h-footer max-w-screen-2xl flex items-center justify-between">
                <span className="text-sm text-text/50">
                    &copy; 2024 {siteConfig.name}
                </span>
                <span className="text-sm text-text/50">
                    Built with <Heart strokeWidth={0} fill="red" className="inline h-4 w-4" /> by {" "}
                    <Link href={siteConfig.links.github} className="underline">
                        {siteConfig.creator}
                    </Link>
                </span>
            </div>
        </footer>
    );
}