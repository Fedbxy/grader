import { allowAccess as importedAllowAccess } from "@/lib/auth";
import { Role } from "@/types/user";
import { redirect, notFound } from "next/navigation";
import { messages } from "@/config/messages";

export async function allowAccess(role: Role, type: "page" | "action" = "page") {
    if (type === "page") {
        return await importedAllowAccess(
            role,
            () => {
                role === "admin" ? notFound() : redirect("/signin");
            },
            () => {
                notFound();
            }
        );
    } else {
        return await importedAllowAccess(
            role,
            () => {
                return {
                    error: messages.auth.unauthenticated,
                };
            },
            () => {
                return {
                    error: messages.auth.unauthorized,
                };
            }
        );
    }
}