"use client";

import { useLocalStorage } from "@/hooks/local-storage";
import { DEFAULT_VERDICT_STYLE } from "@/app/submission/[id]/verdict";

import { Option, OptionGroup } from "./option";

// Tiny drawings of the three layouts, in the verdict colours: green passed,
// red failed, amber over a limit.
const PASS = "bg-constructive";
const FAIL = "bg-destructive";
const LIMIT = "bg-warning";

function Grid() {
  const tests = [PASS, PASS, PASS, FAIL, PASS, PASS, LIMIT, PASS];

  return (
    <div className="flex h-full items-start gap-1 bg-muted/40 p-3">
      {tests.map((tone, i) => (
        <div key={i} className={`size-3 rounded-[3px] ${tone}`} />
      ))}
    </div>
  );
}

function Table() {
  const widths = ["w-4/5", "w-full", "w-3/5", "w-4/5"];

  return (
    <div className="flex h-full flex-col gap-1.5 bg-muted/40 p-3">
      {widths.map((width, i) => (
        <div
          key={i}
          className={`h-1 rounded-full ${width} ${i === 0 ? "bg-foreground/60" : "bg-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

function Classic() {
  return (
    <div className="flex h-full flex-col gap-0.5 bg-muted/40 p-3 font-mono text-[10px] leading-snug whitespace-nowrap text-muted-foreground">
      <span>#1 AC (12ms)</span>
      <span>#2 TLE (1000ms)</span>
    </div>
  );
}

const styles = [
  { value: "grid", label: "Grid", preview: <Grid /> },
  { value: "table", label: "Table", preview: <Table /> },
  { value: "classic", label: "Classic text", preview: <Classic /> },
];

export function VerdictStyleSwitcher() {
  const [verdictStyle, setVerdictStyle] = useLocalStorage(
    "verdictStyle",
    DEFAULT_VERDICT_STYLE,
  );

  const handleStyleChange = (style: string) => {
    setVerdictStyle(style);
  };

  return (
    <OptionGroup id="verdict-style">
      {styles.map(({ value, label, preview }) => (
        <Option
          key={value}
          name="verdict-style"
          value={value}
          label={label}
          checked={verdictStyle === value}
          onSelect={handleStyleChange}
        >
          {preview}
        </Option>
      ))}
    </OptionGroup>
  );
}
