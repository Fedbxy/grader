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