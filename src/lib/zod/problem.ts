import { z } from "zod";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";

export const titleSchema = z.string()
    .min(1, messages.schema.title.required)
    .min(limits.title.min, messages.schema.title.min)
    .max(limits.title.max, messages.schema.title.max);

export const statementSchema = z.instanceof(File).optional()
    .refine(file => file === undefined || file!.size <= limits.statement.size, messages.schema.statement.size)
    .refine(file => file === undefined || limits.statement.type.includes(file!.type), messages.schema.statement.type);

export const testcaseSchema = z.instanceof(File).optional()
    .refine(file => file === undefined || file!.size <= limits.testcase.size, messages.schema.testcase.size)
    .refine(file => file === undefined || limits.testcase.type.includes(file!.type), messages.schema.testcase.type);

export const visibilitySchema = z.enum(["public", "private"]);

export const timeLimitSchema = z.string()
    .min(1, messages.schema.timeLimit.required)
    .regex(limits.timeLimit.regex, messages.schema.timeLimit.outOfRange);

export const memoryLimitSchema = z.string()
    .min(1, messages.schema.memoryLimit.required)
    .regex(limits.memoryLimit.regex, messages.schema.memoryLimit.outOfRange);

export const scoreSchema = z.string()
    .min(1, messages.schema.score.required)
    .regex(limits.score.regex, messages.schema.score.outOfRange);

export const testcasesSchema = z.string()
    .min(1, messages.schema.testcases.required)
    .regex(limits.testcases.regex, messages.schema.testcases.outOfRange);

// ----- FORM SCHEMAS -----

export const editProblemSchema = z.object({
    title: titleSchema,
    statement: statementSchema,
    testcase: testcaseSchema,
    visibility: visibilitySchema,
    timeLimit: timeLimitSchema,
    memoryLimit: memoryLimitSchema,
    score: scoreSchema,
    testcases: testcasesSchema,
});

export const createProblemSchema = z.object({
    title: titleSchema,
    statement: statementSchema,
    testcase: testcaseSchema,
    visibility: visibilitySchema,
    timeLimit: timeLimitSchema,
    memoryLimit: memoryLimitSchema,
    score: scoreSchema,
    testcases: testcasesSchema,
});