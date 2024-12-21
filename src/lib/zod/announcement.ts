import { z } from "zod";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";

export const titleSchema = z.string()
    .min(1, messages.schema.announcement.title.required)
    .min(limits.announcement.title.min, messages.schema.announcement.title.min)
    .max(limits.announcement.title.max, messages.schema.announcement.title.max);

export const contentSchema = z.string()
    .min(1, messages.schema.announcement.content.required)
    .max(limits.announcement.content.max, messages.schema.announcement.content.max);

export const visibilitySchema = z.enum(["public", "private"]);

// ----- FORM SCHEMAS -----

export const createAnnouncementSchema = z.object({
    title: titleSchema,
    content: contentSchema,
    visibility: visibilitySchema,
});

export const editAnnouncementSchema = z.object({
    title: titleSchema,
    content: contentSchema,
    visibility: visibilitySchema,
});