import type { User } from "./user";

export type Announcement = {
    id: number;
    title: string;
    content: string;
    visibility: Visibility;
    authorId: number;
    author: User;
    createdAt: Date;
    updatedAt: Date;
};

export type Visibility = "public" | "private";