import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { cache } from "react";
import { Role, User as DatabaseUserAttributes } from "@/lib/types";

import type { Session, User } from "lucia";
import { redirect } from "next/navigation";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => {
        return {
            id: attributes.id,
            username: attributes.username,
            role: attributes.role,
            displayName: attributes.displayName,
            bio: attributes.bio,
            avatar: attributes.avatar,
        }
    },
});

export const validateRequest = cache(
    async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
        const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return {
                user: null,
                session: null
            };
        }

        const result = await lucia.validateSession(sessionId);
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
            if (!result.session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
        } catch { }
        return result;
    }
);

export async function allowAccess(role: Role) {
    const { user } = await validateRequest();
    if (!user) {
        return redirect("/signin");
    }

    const userRoleValue = roleMap[user.role];
    const roleValue = roleMap[role];

    if (userRoleValue < roleValue) {
        return redirect("/");
    }
}

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        UserId: number;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

const roleMap: Record<Role, number> = {
    "user": 0,
    "admin": 1,
};