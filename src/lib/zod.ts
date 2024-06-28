import { object, string } from "zod";

export const signInSchema = object({
  username: string()
    .min(1, "Username is required")
    .min(3, "Username must be more than 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
});

export const signUpSchema = object({
  username: string()
    .min(1, "Username is required")
    .min(3, "Username must be more than 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
  confirmPassword: string()
    .min(1, "Confirm password is required"),
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Password does not match",
});

export const editProfileSchema = object({
  displayName: string().trim()
    .min(1, "Display name is required")
    .max(30, "Display name must be less than 30 characters"),
  bio: string().trim()
    .max(256, "Bio must be less than 256 characters"),
});

// TODO: make the error message import from the config file