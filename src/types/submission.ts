import { Problem } from "./problem";
import { UserRef } from "./user";

// A row of a submission table. Deliberately has no code.
export type SubmissionRow = {
    id: number;
    hidden: boolean;
    codePublic: boolean;
    // A Date from the server, or an ISO string once it crossed to the client.
    createdAt: Date | string;
    problem: Pick<
        Problem,
        "id" | "title" | "score" | "timeLimit" | "memoryLimit" | "testcases"
    >;
    user: UserRef;
};

export type Language = "c" | "cpp" | "py" | "pypy";