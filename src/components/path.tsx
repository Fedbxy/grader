import { Fragment } from "react";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Path({ path }: { path: string }) {
    const parts = path.split("/").filter((part) => part !== "");

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem key={0}>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {parts.map((part, index) => (
                    <Fragment key={index + 1}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={`/${parts.slice(0, index + 1).join("/")}`}>{part[0].toUpperCase() + part.slice(1)}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}