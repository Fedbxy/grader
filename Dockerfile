FROM oven/bun:1 AS base

RUN apt-get update -y && \
    apt-get install -y openssl adduser && \
    rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile


# The Prisma CLI, with the versions bun.lockb resolved, for `migrate deploy` on
# start. The standalone output only holds what the app imports. Never run it as
# `bunx prisma` in the runner: with no local copy bunx fetches the latest tag,
# which is not the Prisma this app is built for.
FROM deps AS prisma-cli
WORKDIR /app

COPY scripts/copy-prisma-cli.ts ./scripts/
RUN bun scripts/copy-prisma-cli.ts /cli/node_modules
RUN bun /cli/node_modules/prisma/build/index.js --version


FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The client is generated into src/generated/prisma (not committed). `next
# build` needs it, and `bun run build` runs this too; it is listed here so the
# stage reads on its own. It needs no DATABASE_URL.
RUN bunx prisma generate
RUN bun run build


FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN adduser --system --uid 1001 --ingroup bun nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:bun .next

COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static

# Migrations: the CLI and prisma.config.ts, schema and migrations it reads.
COPY --from=prisma-cli --chown=nextjs:bun /cli/node_modules ./migrate/node_modules
COPY --from=builder --chown=nextjs:bun /app/prisma.config.ts ./migrate/prisma.config.ts
COPY --from=builder --chown=nextjs:bun /app/prisma ./migrate/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["sh", "-c", "HOSTNAME=\"0.0.0.0\" bun migrate/node_modules/prisma/build/index.js migrate deploy --config migrate/prisma.config.ts && bun server.js"]