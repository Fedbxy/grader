"use client";

import { useIsClient } from "@/hooks/is-client";
import { useLocalStorage } from "@/hooks/local-storage";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function VerdictStyleSwitcher() {
  const [verdictStyle, setVerdictStyle] = useLocalStorage(
    "verdictStyle",
    "table",
  );
  const isClient = useIsClient();

  if (!isClient) {
    return <Skeleton className="h-9" />;
  }

  const handleStyleChange = (style: string) => {
    setVerdictStyle(style);
    toast.success(`Switched verdict style to ${style}`);
  };

  return (
    <Select defaultValue={verdictStyle} onValueChange={handleStyleChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="table">Table</SelectItem>
        <SelectItem value="classic">Classic</SelectItem>
      </SelectContent>
    </Select>
  );
}
