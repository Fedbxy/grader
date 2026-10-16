"use client";

import { useState } from "react";
import { changePasswordSchema } from "@/lib/zod/user";
import { changePassword } from "@/actions/user";
import { messages } from "@/config/messages";
import { StrengthMeter } from "./meter";
import { passwordStrength } from "./strength";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Circle, CircleAlert, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/shadcn";
import { SettingField, SettingsSection } from "../section";

type Field = "password" | "newPassword" | "confirmNewPassword";

// The word under the meter in the meter's colour.
const STRENGTH_TEXT = [
    "text-destructive",
    "text-destructive",
    "text-warning dark:text-amber-400",
    "text-constructive dark:text-green-400",
    "text-constructive dark:text-green-400",
];

export function ChangePasswordForm() {
    const [values, setValues] = useState<Record<Field, string>>({
        password: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    // One toggle for the new password and its confirmation, so the two can be
    // compared while shown.
    const [showNew, setShowNew] = useState(false);

    const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };

    const strength = passwordStrength(values.newPassword);
    // Told as you type the confirmation, not only when you press the button.
    const mismatch =
        values.confirmNewPassword.length > 0 &&
        values.confirmNewPassword !== values.newPassword;
    const error = (field: Field) =>
        field === "confirmNewPassword" && mismatch
            ? messages.schema.confirmPassword.mismatch
            : errors[field];

    const valid = changePasswordSchema.safeParse(values).success;

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();

        const parsed = changePasswordSchema.safeParse(values);
        if (!parsed.success) {
            const next: Partial<Record<Field, string>> = {};
            for (const issue of parsed.error.issues) {
                const field = issue.path[0] as Field;
                next[field] ??= issue.message;
            }
            return setErrors(next);
        }
        setErrors({});

        const data = new FormData();
        data.append("password", values.password);
        data.append("newPassword", values.newPassword);
        data.append("confirmNewPassword", values.confirmNewPassword);

        setSaving(true);
        const response = await changePassword(data);
        setSaving(false);

        if (response?.error) {
            return toast.error(response.error);
        }

        return toast.success("Successfully changed your password.");
    }

    return (
        <SettingsSection title="Password" description="All other sessions sign out on change.">
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <SettingField id="password" label="Current password">
                    <div className="relative">
                        <Input
                            id="password"
                            type={showCurrent ? "text" : "password"}
                            autoComplete="current-password"
                            className="pr-10"
                            value={values.password}
                            aria-invalid={!!error("password")}
                            onChange={set("password")}
                        />
                        <RevealButton shown={showCurrent} onToggle={() => setShowCurrent((shown) => !shown)} label="current password" />
                    </div>
                    <FieldError message={error("password")} />
                </SettingField>
                <SettingField id="newPassword" label="New password">
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showNew ? "text" : "password"}
                            autoComplete="new-password"
                            className="pr-10"
                            aria-invalid={!!error("newPassword")}
                            aria-describedby="newPassword-strength"
                            value={values.newPassword}
                            onChange={set("newPassword")}
                        />
                        <RevealButton shown={showNew} onToggle={() => setShowNew((shown) => !shown)} label="new password" />
                    </div>
                    <StrengthMeter score={strength.score} label={strength.label} typed={!!values.newPassword} />
                    {/* The rule behind the meter as a checklist: what is met, and
                        for the rest what is still missing. Only the first is
                        required, so only it gets a cross; the others a circle. */}
                    <div id="newPassword-strength" className="flex flex-col gap-1 text-xs">
                        {values.newPassword && (
                            <p className={cn("font-medium motion-safe:transition-colors motion-safe:duration-300", STRENGTH_TEXT[strength.score])} aria-live="polite">
                                {strength.label}
                            </p>
                        )}
                        <ul className="flex flex-col gap-1">
                            {strength.checks.map((check) => (
                                <li key={check.label} className="flex items-start gap-1.5">
                                    {check.met ? (
                                        <Check aria-hidden className="mt-px size-3.5 shrink-0 text-constructive dark:text-green-400" />
                                    ) : check.required ? (
                                        // Red once something is typed; muted on an empty field.
                                        <X
                                            aria-hidden
                                            className={cn(
                                                "mt-px size-3.5 shrink-0",
                                                values.newPassword ? "text-destructive" : "text-muted-foreground",
                                            )}
                                        />
                                    ) : (
                                        <Circle aria-hidden className="mt-px size-3.5 shrink-0 text-muted-foreground" />
                                    )}
                                    <span
                                        className={cn(
                                            "motion-safe:transition-colors motion-safe:duration-300",
                                            check.met
                                                ? "text-constructive dark:text-green-400"
                                                : check.required && values.newPassword
                                                  ? "text-destructive"
                                                  : "text-muted-foreground",
                                        )}
                                    >
                                        <span className="sr-only">{check.met ? "Done: " : "Not yet: "}</span>
                                        {check.label}
                                        {check.required && " (required)"}
                                        {check.hint && <span> · {check.hint}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <FieldError message={error("newPassword")} />
                </SettingField>
                <SettingField id="confirmNewPassword" label="Confirm new password">
                    <div className="relative">
                        <Input
                            id="confirmNewPassword"
                            type={showNew ? "text" : "password"}
                            autoComplete="new-password"
                            className={cn(!!error("confirmNewPassword") && "pr-9")}
                            value={values.confirmNewPassword}
                            aria-invalid={!!error("confirmNewPassword")}
                            onChange={set("confirmNewPassword")}
                        />
                        {error("confirmNewPassword") && (
                            <CircleAlert
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-destructive"
                            />
                        )}
                    </div>
                    <FieldError message={error("confirmNewPassword")} />
                </SettingField>
                <Button type="submit" className="w-full" disabled={!valid || saving}>
                    {saving ? "Saving…" : "Change password"}
                </Button>
            </form>
        </SettingsSection>
    );
}

// The eye button inside a password field that shows or hides what was typed.
function RevealButton({ shown, onToggle, label }: { shown: boolean; onToggle: () => void; label: string }) {
    return (
        <button
            type="button"
            aria-label={`${shown ? "Hide" : "Show"} ${label}`}
            aria-pressed={shown}
            onClick={onToggle}
            className="absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p role="alert" className="text-sm text-destructive">{message}</p>;
}
