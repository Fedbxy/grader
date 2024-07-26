export type User = {
    id: number;
    username: string;
    role: Role;
    displayName: string;
    bio: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Role = "user" | "admin";

export type Problem = {
    id: number;
    title: string;
    publicity: Publicity;
    timeLimit: number;
    memoryLimit: number;
    testcases: number;
    authorId: number;
    author: User;
    createdAt: Date;
    updatedAt: Date;
};

export type Publicity = "public" | "private";