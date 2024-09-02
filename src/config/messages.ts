import { limits } from "./limits";

export const messages = {
    schema: {
        username: {
            required: "Username is required",
            min: `Username must be more than ${limits.username.min} characters`,
            max: `Username must be less than ${limits.username.max} characters`,
            regex: "Username can only contain letters, numbers, and underscores",
        },
        password: {
            required: "Password is required",
            min: `Password must be more than ${limits.password.min} characters`,
        },
        confirmPassword: {
            required: "Confirm password is required",
            mismatch: "Password does not match",
        },
        displayName: {
            required: "Display name is required",
            max: `Display name must be less than ${limits.displayName.max} characters`,
        },
        avatar: {
            size: `Avatar must be less than ${limits.avatar.size / 1024 / 1024}MB`,
            type: `Avatar must be one of the following types: ${limits.avatar.type.join(", ")}`,
        },
        bio: {
            max: `Bio must be less than ${limits.bio.max} characters`,
        },
        title: {
            required: "Title is required",
            min: `Title must be more than ${limits.title.min} characters`,
            max: `Title must be less than ${limits.title.max} characters`,
        },
        statement: {
            size: `Statement must be less than ${limits.statement.size / 1024 / 1024}MB`,
            type: `Statement must be one of the following types: ${limits.statement.type.join(", ")}`,
        },
        score: {
            required: "Score is required",
            outOfRange: `Score must be between ${limits.score.min} and ${limits.score.max}`,
        },
        testcase: {
            size: `Testcase must be less than ${limits.testcase.size / 1024 / 1024}MB`,
            type: `Testcase must be one of the following types: ${limits.testcase.type.join(", ")}`,
        },
        timeLimit: {
            required: "Time limit is required",
            outOfRange: `Time limit must be between ${limits.timeLimit.min} and ${limits.timeLimit.max} milliseconds`,
        },
        memoryLimit: {
            required: "Memory limit is required",
            outOfRange: `Memory limit must be between ${limits.memoryLimit.min} and ${limits.memoryLimit.max} MB`,
        },
        testcases: {
            required: "Testcases is required",
            outOfRange: `Testcases must be between ${limits.testcases.min} and ${limits.testcases.max}`,
        },
        code: {
            required: "Code is required",
            max: `Code must be less than ${limits.code.max} characters`,
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
        noSubmission: "Submission not found.",
    },
    toast: {
        success: "Success!",
        error: "Uh oh! Something went wrong.",
    },
};

export const maps = {
    submission: {
        verdict: {
            AC: "Accepted",
            WA: "Wrong Answer",
            TLE: "Time Limit Exceeded",
            MLE: "Memory Limit Exceeded",
            SKP: "Skipped",
            RE: "Runtime Error",
            CE: "Compilation Error",
            JE: "Judge Error",
            SE: "System Error",
        },
    }
}