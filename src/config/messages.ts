import { memo } from "react";

export const messages = {
    schema: {
        username: {
            required: "Username is required",
            min: "Username must be more than 3 characters",
            max: "Username must be less than 20 characters",
            regex: "Username can only contain letters, numbers, and underscores",
        },
        password: {
            required: "Password is required",
            min: "Password must be more than 8 characters",
        },
        confirmPassword: {
            required: "Confirm password is required",
            mismatch: "Password does not match",
        },
        displayName: {
            required: "Display name is required",
            max: "Display name must be less than 30 characters",
        },
        bio: {
            max: "Bio must be less than 256 characters",
        },
        title: {
            required: "Title is required",
            min: "Title must be more than 3 characters",
            max: "Title must be less than 30 characters",
        },
        statement: {
            size: "Statement must be less than 10MB",
            type: "Statement must be a PDF file",
        },
        timeLimit: {
            required: "Time limit is required",
            outOfRange: "Time limit must be between 1ms and 10000ms",
        },
        memoryLimit: {
            required: "Memory limit is required",
            outOfRange: "Memory limit must be between 1MB and 1024MB",
        },
        testcases: {
            required: "Testcases is required",
            outOfRange: "Testcases must be between 1 and 100",
        },
    },
    form: {
        invalid: "Your request is invalid.",
        unexpected: "An unexpected error occurred. Please try again later.",
        noChanges: "No changes were made.",
        samePassword: "New password must be different from the current password.",
        invalidPassword: "Your current password is invalid.",
    },
    auth: {
        unauthenticated: "You must be signed in to perform this action.",
        signedIn: "You are already signed in.",
        usernameTaken: "Username is already taken.",
        wrongCredentials: "Invalid username or password.",
        noSession: "Session not found.",
    },
    database: {
        noUser: "User not found.",
        noProblem: "Problem not found.",
    },
    toast: {
        success: "Success!",
        error: "Uh oh! Something went wrong.",
    },
};