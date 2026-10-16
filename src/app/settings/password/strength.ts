import { limits } from "@/config/limits";

export type Strength = {
    // 0 (too short) to 4.
    score: number;
    label: string;
};

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

// A rough guide, not a guarantee: length and the kinds of characters used.
// Below the minimum length nothing else counts, as the password is refused.
export function passwordStrength(password: string): Strength {
    if (password.length < limits.password.min) {
        return { score: 0, label: LABELS[0] };
    }

    const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((kind) =>
        kind.test(password),
    ).length;
    const score =
        1 +
        (password.length >= 12 ? 1 : 0) +
        (kinds >= 2 ? 1 : 0) +
        (kinds >= 3 && password.length >= 10 ? 1 : 0);

    return { score, label: LABELS[score] };
}
