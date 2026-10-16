"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/shadcn";
import { useIsClient } from "@/hooks/is-client";

import { Option, OptionGroup } from "./option";

// A page in miniature, in fixed colours so each option looks the same whatever
// theme is on now: a title, two lines of text and a button.
function Page({ dark }: { dark: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-1.5 p-2",
        dark ? "bg-neutral-900" : "bg-white",
      )}
    >
      <div className={cn("h-1.5 w-8 rounded-full", dark ? "bg-neutral-100" : "bg-neutral-800")} />
      <div className={cn("h-1 w-full rounded-full", dark ? "bg-neutral-700" : "bg-neutral-200")} />
      <div className={cn("h-1 w-4/5 rounded-full", dark ? "bg-neutral-700" : "bg-neutral-200")} />
      <div className="mt-auto h-2.5 w-8 rounded-sm bg-blue-500" />
    </div>
  );
}

const themes = [
  { value: "dark", label: "Dark", preview: <Page dark /> },
  { value: "light", label: "Light", preview: <Page dark={false} /> },
  {
    // Light with the dark page showing through the lower right half.
    value: "system",
    label: "System",
    preview: (
      <div className="relative h-full w-full">
        <Page dark={false} />
        <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
          <Page dark />
        </div>
      </div>
    ),
  },
];

export function ThemeSwitcher() {
  // The theme is only known in the browser; until then none is shown chosen.
  const mounted = useIsClient();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return (
    <OptionGroup id="theme">
      {themes.map(({ value, label, preview }) => (
        <Option
          key={value}
          name="theme"
          value={value}
          label={label}
          checked={mounted && theme === value}
          onSelect={handleThemeChange}
        >
          {preview}
        </Option>
      ))}
    </OptionGroup>
  );
}
