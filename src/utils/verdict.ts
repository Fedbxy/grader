// The one rule for what a submission's verdict is, shared by the verdict cell
// (one submission, live) and the admin profile breakdown (many, server-side).

// The first testcase that did not pass, walking the subtasks in order, with its
// 1-based position across all of them. A skipped case (SKP, not run because an
// earlier one failed) only names the failure when nothing else failed. Null
// when every case passed (or there are none to look at).
export function firstFailure(verdicts: string[][] | undefined) {
    let position = 0;
    let skipped: { verdict: string; position: number } | null = null;

    for (const subtask of verdicts ?? []) {
        for (const verdict of subtask) {
            position++;
            if (verdict === "AC") continue;
            if (verdict === "SKP") {
                skipped ??= { verdict, position };
                continue;
            }
            return { verdict, position };
        }
    }

    return skipped;
}

export type SubmissionVerdict = {
    // "running" while queued or being judged (status is set); otherwise AC, CE,
    // JE, SE, or the first failing testcase's verdict (WA when none is named).
    code: string;
    // 1-based testcase that failed, when a testcase is what failed.
    position?: number;
};

export function submissionVerdict(
    submission: {
        errorCode: string | null;
        status: string | null;
        score: number;
        result: { verdicts?: string[][] } | null | undefined;
    },
    testcases: number,
): SubmissionVerdict {
    if (submission.status !== null) return { code: "running" };
    if (submission.errorCode === "CE") return { code: "CE" };
    if (submission.errorCode === "JE" || submission.errorCode === "SE") return { code: submission.errorCode };

    // The same rule as utils/accepted.ts: no error, and every testcase passed.
    if (!submission.errorCode && testcases > 0 && submission.score === testcases) return { code: "AC" };

    const failure = firstFailure(submission.result?.verdicts);
    return failure ? { code: failure.verdict, position: failure.position } : { code: "WA" };
}
