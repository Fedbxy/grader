import { limits } from "@/config/limits";

export type StrengthCheck = {
    label: string;
    met: boolean;
    // What is still missing, e.g. "3 more" or "add numbers or symbols";
    // nothing once met or while the field is empty.
    hint?: string;
    required?: boolean;
};

export type Strength = {
    // 0 (too short) to 4: one point per check met.
    score: number;
    label: string;
    checks: StrengthCheck[];
};

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const LONG = 12;
const KINDS = [
    { name: "lowercase", test: /[a-z]/ },
    { name: "uppercase", test: /[A-Z]/ },
    { name: "numbers", test: /[0-9]/ },
    { name: "symbols", test: /[^a-zA-Z0-9]/ },
];

// "uppercase, numbers or symbols"
function either(names: string[]) {
    return names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names.at(-1)}` : names[0];
}

// A rough guide, not a guarantee: length and the kinds of characters used,
// one point per check, so the list under the meter is the whole rule. Only
// the minimum length is enforced; below it nothing else counts.
export function passwordStrength(password: string): Strength {
    const typed = password.length > 0;
    const length = password.length;
    const missing = KINDS.filter((kind) => !kind.test.test(password)).map((kind) => kind.name);
    const kinds = KINDS.length - missing.length;
    const add = typed ? `add ${either(missing)}` : undefined;

    const checks: StrengthCheck[] = [
        {
            label: `At least ${limits.password.min} characters`,
            met: length >= limits.password.min,
            hint: typed ? `${limits.password.min - length} more` : undefined,
            required: true,
        },
        { label: `${LONG} characters or more`, met: length >= LONG, hint: typed ? `${LONG - length} more` : undefined },
        { label: "Two kinds of characters", met: kinds >= 2, hint: add },
        { label: "Three kinds of characters", met: kinds >= 3, hint: add },
    ].map((check) => (check.met ? { ...check, hint: undefined } : check));

    const score = checks[0].met ? checks.filter((check) => check.met).length : 0;
    return { score, label: LABELS[score], checks };
}
