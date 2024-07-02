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
        }
    },
    form: {
        invalid: "Your request is invalid.",
        unexpected: "An unexpected error occurred. Please try again later.",
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
        noChanges: "No changes were made.",
    }
};