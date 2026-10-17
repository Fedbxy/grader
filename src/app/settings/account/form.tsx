"use client";

import { useEffect, useRef, useState } from "react";
import { avatarSchema, bioSchema, displayNameSchema } from "@/lib/zod/user";
import { editAccount } from "@/actions/user";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/shadcn";
import type { User } from "lucia";
import { useRouter } from "next/navigation";
import { SettingField, SettingsSection } from "../section";
import { SaveNote, useSaveStatus } from "@/components/save-note";

type Field = "avatar" | "displayName" | "bio";

const AVATAR_HINT = `${limits.avatar.type
    .map((type) => type.replace("image/", "").replace("jpeg", "jpg"))
    .join("/")} · max ${limits.avatar.size / (1024 * 1024)}MB`;

// How long typing has to pause before a text field saves.
const TYPING_SAVE_DELAY = 800;

// Every field saves on its own: a text field a moment after you stop typing
// and at once when you leave it, the avatar as soon as you pick one. Closing
// the page while a change is unsaved asks first. A change that fails is
// reported beside its field; leaving the field puts back what is saved.
export function EditAccountForm({ user }: { user: User }) {
    const router = useRouter();
    const { status, saving, saved, idle } = useSaveStatus();

    const [displayName, setDisplayName] = useState(user.displayName);
    const [bio, setBio] = useState(user.bio ?? "");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

    // What the server has, which is what a failed change goes back to and what
    // the other fields are sent with: the action takes the whole profile.
    const stored = useRef({ displayName: user.displayName, bio: user.bio ?? "" });
    // Saves run one after another, so a slow one can't overwrite a later one.
    const queue = useRef<Promise<unknown>>(Promise.resolve());
    // The value last sent (or saved) per field, so a pause and then leaving the
    // field don't send the same change twice.
    const sent = useRef({ ...stored.current });
    // What is in each field now, and how many saves are on their way, for the
    // warning when the page is closed.
    const typed = useRef({ ...stored.current });
    const inFlight = useRef(0);
    const timers = useRef<Partial<Record<"displayName" | "bio", ReturnType<typeof setTimeout>>>>({});
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    useEffect(() => {
        function warn(event: BeforeUnloadEvent) {
            const unsaved =
                inFlight.current > 0 ||
                typed.current.displayName !== stored.current.displayName ||
                typed.current.bio !== stored.current.bio;
            if (unsaved) event.preventDefault();
        }
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, []);

    // Resolves to the reason it failed, or null once saved.
    function save(change: { displayName?: string; bio?: string; avatar?: File }) {
        const task = queue.current.then(async (): Promise<string | null> => {
            const next = { ...stored.current, ...change };
            const data = new FormData();
            if (change.avatar) data.append("avatar", change.avatar);
            data.append("displayName", next.displayName);
            data.append("bio", next.bio);

            saving();
            inFlight.current++;
            // The action throws when the server answers with an error of its own
            // instead of a result, e.g. a body over the size limit.
            const response = await editAccount(data)
                .catch(() => null)
                .finally(() => inFlight.current--);
            if (response === null) {
                idle();
                return messages.form.rejected;
            }

            // Saved only when the action says where to go next. No result at all is
            // what a request blocked before reaching the server (by a firewall) gives.
            if (!response?.redirectTo) {
                idle();
                return response?.error ?? messages.form.noResponse;
            }

            stored.current = { displayName: next.displayName, bio: next.bio };
            saved();
            router.refresh();
            return null;
        });
        queue.current = task;
        return task;
    }

    // Saves a text field's value. While typing (`left` false) a failure keeps
    // what was typed, so a keystroke isn't undone under you; leaving the field
    // puts back what is saved.
    async function commit(field: "displayName" | "bio", value: string, left: boolean) {
        clearTimeout(timers.current[field]);
        const schema = field === "displayName" ? displayNameSchema : bioSchema;
        const parsed = schema.safeParse(value);
        if (!parsed.success) {
            // Left as typed so it can be fixed; nothing is sent.
            return setErrors((current) => ({ ...current, [field]: parsed.error.issues[0].message }));
        }

        const set = field === "displayName" ? setDisplayName : setBio;
        if (left) set(parsed.data);
        if (parsed.data === sent.current[field]) {
            return;
        }

        sent.current[field] = parsed.data;
        const error = await save({ [field]: parsed.data });
        if (error) {
            sent.current[field] = stored.current[field];
            if (left) {
                set(stored.current[field]);
                typed.current[field] = stored.current[field];
            }
            setErrors((current) => ({ ...current, [field]: error }));
        }
    }

    function type(field: "displayName" | "bio", value: string) {
        (field === "displayName" ? setDisplayName : setBio)(value);
        typed.current[field] = value;
        clearError(field);
        clearTimeout(timers.current[field]);
        timers.current[field] = setTimeout(() => commit(field, value, false), TYPING_SAVE_DELAY);
    }

    function clearError(field: Field) {
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    async function onAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // So choosing the same file again still counts as a change.
        event.target.value = "";
        if (!file) return;

        const parsed = avatarSchema.safeParse(file);
        if (!parsed.success) {
            return setErrors((current) => ({ ...current, avatar: parsed.error.issues[0].message }));
        }

        clearError("avatar");
        const before = avatarPreview;
        setAvatarPreview(URL.createObjectURL(file));
        const error = await save({ avatar: file });
        if (error) {
            setAvatarPreview(before);
            setErrors((current) => ({ ...current, avatar: error }));
        }
    }

    return (
        <SettingsSection title="Account" description="How other people see you on your profile and submissions.">
            <div className="flex items-start gap-4">
                <Avatar className="size-14">
                    <AvatarImage
                        src={avatarPreview ?? (user.avatar ? `/api/user/${user.id}/avatar` : "")}
                        alt={user.username}
                    />
                    <AvatarFallback className="text-xl">
                        {user.displayName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col items-start gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-describedby="avatar-hint"
                        onClick={() => fileInput.current?.click()}
                    >
                        Change avatar
                    </Button>
                    <input
                        ref={fileInput}
                        type="file"
                        className="hidden"
                        accept={limits.avatar.type.join(", ")}
                        onChange={onAvatar}
                    />
                    <p id="avatar-hint" className="text-xs text-muted-foreground">
                        {AVATAR_HINT}
                    </p>
                    {errors.avatar && (
                        <p role="alert" className="text-sm text-destructive">{errors.avatar}</p>
                    )}
                </div>
            </div>
            <SettingField
                id="username"
                label="Username"
                hint="Username cannot be changed."
            >
                <Input
                    id="username"
                    value={user.username}
                    readOnly
                    aria-describedby="username-hint"
                    className="cursor-not-allowed bg-input/50 text-muted-foreground focus-visible:ring-0"
                />
            </SettingField>
            <SettingField id="displayName" label="Display name">
                <div className="relative">
                    <Input
                        id="displayName"
                        className="pr-14"
                        value={displayName}
                        aria-invalid={!!errors.displayName}
                        aria-describedby="displayName-error"
                        onChange={(event) => type("displayName", event.target.value)}
                        onBlur={(event) => commit("displayName", event.target.value, true)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                        }}
                    />
                    <span
                        className={cn(
                            "pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs tabular-nums",
                            displayName.length > limits.displayName.max
                                ? "text-destructive"
                                : "text-muted-foreground",
                        )}
                    >
                        {displayName.length}/{limits.displayName.max}
                    </span>
                </div>
                <p id="displayName-error" role="alert" className="text-sm text-destructive empty:hidden">
                    {errors.displayName}
                </p>
            </SettingField>
            <SettingField id="bio" label="Bio">
                <Textarea
                    id="bio"
                    className="h-32 resize-none"
                    value={bio}
                    aria-invalid={!!errors.bio}
                    aria-describedby="bio-error"
                    onChange={(event) => type("bio", event.target.value)}
                    onBlur={(event) => commit("bio", event.target.value, true)}
                />
                <div className="flex items-start justify-between gap-4">
                    <p id="bio-error" role="alert" className="text-sm text-destructive empty:hidden">
                        {errors.bio}
                    </p>
                    <span
                        className={cn(
                            "ml-auto shrink-0 text-xs tabular-nums",
                            bio.length > limits.bio.max ? "text-destructive" : "text-muted-foreground",
                        )}
                    >
                        {bio.length}/{limits.bio.max}
                    </span>
                </div>
            </SettingField>
            <SaveNote status={status} />
        </SettingsSection>
    );
}
