import { Problem } from "./problem";
import { User } from "./user";
import type { Prisma } from "@prisma/client";

export type Submission = {
    id: number;
    code: string;
    language: Language;
    score: number;
    result: Prisma.JsonValue | null;
    status: string | null;
    errorCode: string | null;
    error: string | null;
    problemId: number;
    userId: number;
    problem: Problem;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}   

export type Language = "c" | "cpp" | "py";