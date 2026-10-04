import type { UserRef } from "./user";

export type Announcement = {
    id: number;
    title: string;
    content: string;
    visibility: Visibility;
    authorId: number;
    author: UserRef;
    createdAt: Date;
    updatedAt: Date;
};

export type Visibility = "public" | "private";