"use client";

import { useState } from "react";
import { changePasswordSchema } from "@/lib/zod/user";
import { changePassword } from "@/actions/user";
import { limits } from "@/config/limits";
import { messages } from "@/config/messages";
import { passwordStrength } from "./strength";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, CircleAlert } from "lucide-react";
import { cn } from "@/lib/shadcn";
import { SettingField, SettingsSection } from "../section";

type Field = "password" | "newPassword" | "confirmNewPassword";

// How many of the four segments are lit, and in what colour, per score.
const SEGMENTS = 4;
const STRENGTH_TONE = ["bg-destructive", "bg-destructive", "bg-warning", "bg-constructive", "bg-constructive"];

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
                    <div
                        role="meter"
                        aria-label="Password strength"
                        aria-valuemin={0}
                        aria-valuemax={SEGMENTS}
                        aria-valuenow={values.newPassword ? strength.score : 0}
                        aria-valuetext={values.newPassword ? strength.label : "Not entered"}
                        className="grid grid-cols-4 gap-1"
                    >
                        {Array.from({ length: SEGMENTS }, (_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 rounded-full",
                                    values.newPassword && i < strength.score
                                        ? STRENGTH_TONE[strength.score]
                                        : "bg-muted",
                                )}
                            />
                        ))}
                    </div>
                    <p id="newPassword-strength" className="text-xs text-muted-foreground">
                        {values.newPassword && strength.score > 0
                            ? `${strength.label} · length beats complexity`
                            : `At least ${limits.password.min} characters.`}
                    </p>
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
