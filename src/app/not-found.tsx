import { Metadata } from "next";

import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
    title: "404 Not Found",
};

export default function NotFound() {
    return (
        <div className="container flex flex-col items-center justify-center space-y-2 min-h-screen-minus-header-footer">
            <div className="flex space-x-4 items-center h-12">
                <h1 className="text-2xl font-medium">404</h1>
                <Separator orientation="vertical" />
                <h1 className="text-xl">Page not found</h1>
            </div>
        </div>
    );
}