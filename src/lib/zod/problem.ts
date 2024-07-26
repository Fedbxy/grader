import { z } from "zod";
import { messages } from "@/config/messages";

export const titleSchema = z.string()
    .min(1, messages.schema.title.required)
    .min(3, messages.schema.title.min)
    .max(30, messages.schema.title.max);

export const publicitySchema = z.enum(["public", "private"]);

export const timeLimitSchema = z.string()
    .min(1, messages.schema.timeLimit.required)
    .regex(/^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-9][0-9][0-9][0-9]|10000)$/, messages.schema.timeLimit.outOfRange);

export const memoryLimitSchema = z.string()
    .min(1, messages.schema.memoryLimit.required)
    .regex(/^([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|10[01][0-9]|102[0-4])$/, messages.schema.memoryLimit.outOfRange);

export const testcasesSchema = z.string()
    .min(1, messages.schema.testcases.required)
    .regex(/^([1-9]|[1-9][0-9]|100)$/, messages.schema.testcases.outOfRange);

// ----- FORM SCHEMAS -----

export const editProblemSchema = z.object({
    title: titleSchema,
    publicity: publicitySchema,
    timeLimit: timeLimitSchema,
    memoryLimit: memoryLimitSchema,
    testcases: testcasesSchema,
});

export const createProblemSchema = z.object({
    title: titleSchema,
    publicity: publicitySchema,
    timeLimit: timeLimitSchema,
    memoryLimit: memoryLimitSchema,
    testcases: testcasesSchema,
});