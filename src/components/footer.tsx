import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
    return (
        <footer className="bg-background/95 border-t-2 border-border/40">
            <div className="container h-footer max-w-screen-2xl flex items-center justify-between">
                <span className="text-sm text-text/50">
                    &copy; 2024 {siteConfig.name}
                </span>
                <span className="text-sm text-text/50">
                    Built with <span role="img" aria-label="heart">❤️</span> by{" "}
                    <Link href={siteConfig.links.github} className="underline">
                        {siteConfig.creator}
                    </Link>
                </span>
            </div>
        </footer>
    );
}