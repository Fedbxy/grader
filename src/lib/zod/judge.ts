import { z } from "zod";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";

export const languageSchema = z.enum(["c", "cpp", "py"]);

export const codeSchema = z.string()
    .min(1, messages.schema.code.required)
    .max(limits.code.max, messages.schema.code.max);

// ----- FORM SCHEMAS -----

export const submitSchema = z.object({
    language: languageSchema,
    code: codeSchema,
});