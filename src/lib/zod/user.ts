import { z } from "zod";
import { messages } from "@/config/messages";
import { limits } from "@/config/limits";

export const usernameSchema = z.string()
  .min(1, messages.schema.username.required)
  .min(limits.username.min, messages.schema.username.min)
  .max(limits.username.max, messages.schema.username.max)
  .regex(limits.username.regex, messages.schema.username.regex);

export const passwordSchema = z.string()
  .min(1, messages.schema.password.required)
  .min(limits.password.min, messages.schema.password.min);

export const confirmPasswordSchema = z.string()
  .min(1, messages.schema.confirmPassword.required);

export const displayNameSchema = z.string().trim()
  .min(1, messages.schema.displayName.required)
  .max(limits.displayName.max, messages.schema.displayName.max);

export const avatarSchema = z.instanceof(File).optional()
  .refine(file => file === undefined || file!.size <= limits.avatar.size, messages.schema.avatar.size)
  .refine(file => file === undefined || limits.avatar.type.includes(file!.type), messages.schema.avatar.type);

export const bioSchema = z.string().trim()
  .max(limits.bio.max, messages.schema.bio.max);

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
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: messages.schema.confirmPassword.mismatch,
});

export const editAccountSchema = z.object({
  avatar: avatarSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
});

export const changePasswordSchema = z.object({
  password: passwordSchema,
  newPassword: passwordSchema,
  confirmNewPassword: confirmPasswordSchema,
}).refine(data => data.newPassword === data.confirmNewPassword, {
  path: ["confirmNewPassword"],
  message: messages.schema.confirmPassword.mismatch
}).refine(data => data.password !== data.newPassword, {
  path: ["newPassword"],
  message: messages.form.samePassword
});

export const editUserSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  avatar: avatarSchema,
  bio: bioSchema,
  role: roleSchema,
  password: z.string()
    .refine(value => value.length === 0 || value.length >= limits.password.min, messages.schema.password.min),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: messages.schema.confirmPassword.mismatch
}
);