export type User = {
    id: number;
    username: string;
    role: Role;
    isBanned: boolean;
    displayName: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Role = "user" | "admin";

// The part of a user that is safe to show next to something they own.
export type UserRef = Pick<User, "id" | "displayName">;