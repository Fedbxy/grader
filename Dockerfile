FROM node:20-alpine
FROM oven/bun:1.1

WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]