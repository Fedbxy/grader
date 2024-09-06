"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/local-storage";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function StyleSwitcher() {
    const [verdictStyle, setVerdictStyle] = useLocalStorage("verdictStyle", "accordion");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (verdictStyle) {
            setIsLoading(false);
        }
    }, [verdictStyle]);

    if (isLoading) {
        return (
            <Skeleton className="h-9" />
        );
    }

    const handleStyleChange = (style: string) => {
        setVerdictStyle(style);
        window.location.reload();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <span>{verdictStyle === "accordion" ? "Accordion" : "Classic"}</span>
                    <span className="sr-only">Toggle style</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStyleChange("accordion")}>
                    Accordion
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStyleChange("classic")}>
                    Classic
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}