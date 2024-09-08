import { User } from "./user";

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