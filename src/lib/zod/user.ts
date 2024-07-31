import { z } from "zod";
import { messages } from "@/config/messages";

export const usernameSchema = z.string()
  .min(1, messages.schema.username.required)
  .min(3, messages.schema.username.min)
  .max(20, messages.schema.username.max)
  .regex(/^[a-zA-Z0-9_]*$/, messages.schema.username.regex);

export const passwordSchema = z.string()
  .min(1, messages.schema.password.required)
  .min(8, messages.schema.password.min);

export const confirmPasswordSchema = z.string()
  .min(1, messages.schema.confirmPassword.required);

export const displayNameSchema = z.string().trim()
  .min(1, messages.schema.displayName.required)
  .max(30, messages.schema.displayName.max);

export const bioSchema = z.string().trim()
  .max(256, messages.schema.bio.max);

export const roleSchema = z.enum(["user", "admin"]);

// ----- FORM SCHEMAS -----

export const signInSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
}).refine(data => data.password === data.confirmPassword, messages.schema.confirmPassword.mismatch);

export const editAccountSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
});

export const changePasswordSchema = z.object({
  password: passwordSchema,
  newPassword: passwordSchema,
  confirmNewPassword: confirmPasswordSchema,
}).refine(data => data.newPassword === data.confirmNewPassword, messages.schema.confirmPassword.mismatch)
  .refine(data => data.password !== data.newPassword, messages.form.samePassword);

export const editUserSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  role: roleSchema,
  password: z.string()
    .refine(value => value.length === 0 || value.length >= 8, messages.schema.password.min),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, messages.schema.confirmPassword.mismatch);