import { Problem } from "./problem";
import { User } from "./user";

export type Submission = {
    id: number;
    code: string;
    language: Language;
    score: number;
    verdict: string[];
    time: number[];
    memory: number[];
    error: string | null;
    problemId: number;
    userId: number;
    problem: Problem;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}

export type Language = "c" | "cpp" | "py";