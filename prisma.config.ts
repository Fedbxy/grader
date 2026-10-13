import { defineConfig } from "prisma/config";

// The Prisma CLI no longer reads .env on its own. Bun does when it runs the
// CLI; under Node (and in the Docker image, where DATABASE_URL is already in
// the container env) there is nothing to load.
try {
    process.loadEnvFile();
} catch {}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "bun prisma/seed.ts",
    },
    datasource: {
        // Not env("DATABASE_URL"): that throws while the config loads, and
        // `prisma generate` (Docker build stage) runs with no database URL.
        url: process.env.DATABASE_URL,
    },
});
