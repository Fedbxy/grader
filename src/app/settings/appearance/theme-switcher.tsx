"use client";

import { useTheme } from "next-themes";

import { useIsClient } from "@/hooks/is-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeSwitcher() {
  const mounted = useIsClient();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return <Skeleton className="h-9" />;
  }

  return (
    <Select defaultValue={theme} onValueChange={setTheme}>
      <SelectTrigger>
          <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
