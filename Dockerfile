FROM oven/bun:1 AS base

RUN apt-get update -y && \
    apt-get install -y openssl1.1 && \
    rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile


FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
COPY --from=builder --chown=nextjs:bun /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["sh", "-c", "HOSTNAME=\"0.0.0.0\" bunx prisma migrate deploy && bun server.js"]