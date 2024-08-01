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
    statement: File | null;
    visibility: Visibility;
    timeLimit: number;
    memoryLimit: number;
    testcases: number;
    authorId: number;
    author: User;
    createdAt: Date;
    updatedAt: Date;
};

export type Visibility = "public" | "private";