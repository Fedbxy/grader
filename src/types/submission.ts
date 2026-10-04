import { Problem } from "./problem";
import { UserRef } from "./user";

// A row of a submission table. Deliberately has no code.
export type SubmissionRow = {
    id: number;
    problem: Pick<
        Problem,
        "id" | "title" | "score" | "timeLimit" | "memoryLimit" | "testcases"
    >;
    user: UserRef;
};

export type Language = "c" | "cpp" | "py" | "pypy";