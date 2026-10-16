import { cn } from "@/lib/shadcn";

// One section of the settings page: a heading and a line under it, then its
// content. Forms stay narrow; the appearance cards use the whole pane.
export function SettingsSection({
  title,
  description,
  wide,
  children,
}: {
  title: string;
  description: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col gap-6", !wide && "max-w-2xl")}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

// One setting: its name above the control and a line of explanation below it.
// The id goes on the control, so the label names it; for a group of options
// (`group`) the name is a plain heading the group points at instead.
export function SettingField({
  id,
  label,
  hint,
  group,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  group?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {group ? (
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
      ) : (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
