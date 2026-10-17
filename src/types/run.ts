// A run: the user's code against their own input, without submitting (#67).
// Runs live in their own table and never count towards anything.

// How the program ended, once it ran. A compile error is errorCode "CE" instead.
export type RunVerdict = "OK" | "TLE" | "MLE" | "RE";

// What GET /api/run/[id] returns. Only the run's owner can read it.
export type RunResult = {
    id: number;
    // Progress text while queued or running ("In queue", "Compiling",
    // "Running"); null once finished.
    status: string | null;
    judgeStatus: "pending" | "judging" | "done" | "failed";
    verdict: RunVerdict | null;
    // Set for RE: the exit code, or the signal that killed the program.
    exitCode: number | null;
    exitSignal: number | null;
    // Capped by the judge at limits.run.output bytes each.
    stdout: string | null;
    stdoutTruncated: boolean;
    stderr: string | null;
    stderrTruncated: boolean;
    // Milliseconds and kilobytes, as for submissions.
    time: number | null;
    memory: number | null;
    // "CE" is the user's (error holds the compiler output); "JE" and "SE"
    // are the judge's.
    errorCode: "CE" | "JE" | "SE" | null;
    error: string | null;
};

// What the runCode server action resolves to.
export type RunActionResult =
    | { runId: number; error?: never }
    | { error: string; runId?: never };
