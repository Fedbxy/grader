export type User = {
    id: number;
    username: string;
    role: Role;
    displayName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Role = "user" | "admin";

export type Problem = {
    id: number;
    title: string;
    visibility: Visibility;
    timeLimit: number;
    memoryLimit: number;
    score: number;
    testcases: number;
    authorId: number;
    author: User;
    createdAt: Date;
    updatedAt: Date;
};

export type Visibility = "public" | "private";

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