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