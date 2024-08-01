export const limits = {
    username: {
        min: 3,
        max: 20,
        regex: /^[a-zA-Z0-9_]*$/,
    },
    password: {
        min: 8,
    },
    displayName: {
        max: 30,
    },
    avatar: {
        size: 2 * 1024 * 1024,
        type: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ],
    },
    bio: {
        max: 256,
    },
    title: {
        min: 3,
        max: 30,
    },
    statement: {
        size: 10 * 1024 * 1024,
        type: [
            "application/pdf",
        ],
    },
    timeLimit: {
        min: 1,
        max: 10000,
        regex: /^([1-9]|[1-9][0-9]{1,3}|10000)$/,
    },
    memoryLimit: {
        min: 1,
        max: 1024,
        regex: /^([1-9]|[1-9][0-9]{1,2}|10[01][0-9]|102[0-4])$/,
    },
    testcases: {
        min: 1,
        max: 100,
        regex: /^([1-9]|[1-9][0-9]|100)$/,
    }
};