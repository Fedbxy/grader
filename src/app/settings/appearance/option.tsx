import { cn } from "@/lib/shadcn";
import { Check } from "lucide-react";

// A set of options drawn as small pictures, one of which is chosen. Real radio
// buttons underneath, so the arrow keys move between them.
export function OptionGroup({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      className="grid grid-cols-3 gap-3"
    >
      {children}
    </div>
  );
}

// A card: the picture on top, its name and a tick (when chosen) in a strip
// below. The ring comes from the radio input, which sits just before the card.
export function Option({
  name,
  value,
  label,
  checked,
  onSelect,
  children,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="min-w-0 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-md border transition-colors",
          "hover:border-muted-foreground/50 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/40",
          "peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50",
        )}
      >
        <div aria-hidden className="h-20 overflow-hidden">
          {children}
        </div>
        <div
          className={cn(
            "flex items-center justify-between gap-2 border-t px-2.5 py-1.5 text-sm",
            checked ? "font-medium" : "text-muted-foreground",
          )}
        >
          <span className="truncate">{label}</span>
          {checked && <Check aria-hidden className="size-4 shrink-0 text-primary" />}
        </div>
      </div>
    </label>
  );
}
