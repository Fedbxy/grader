// Copies the Prisma CLI and everything it needs at runtime out of node_modules
// into a directory, keeping the versions bun.lockb resolved. The Docker image
// runs `prisma migrate deploy` on start, and the Next standalone output only
// holds what the app imports, so the CLI has to come from somewhere else
// without dragging the other ~1 GB of dev dependencies along.
//
//   bun scripts/copy-prisma-cli.ts <destination>
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const destination = resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("usage: copy-prisma-cli.ts <destination>");

const root = resolve("node_modules");
const copied = new Set<string>();

// Node's lookup: the nearest node_modules/<name> walking up from `from`.
function locate(name: string, from: string): string {
    for (let dir = from; ; dir = dirname(dir)) {
        const candidate = join(dir, "node_modules", name);
        if (existsSync(join(candidate, "package.json"))) return candidate;
        if (dir === dirname(dir)) break;
    }
    throw new Error(`cannot resolve ${name} from ${from}`);
}

function visit(name: string, from: string) {
    const dir = locate(name, from);
    if (copied.has(dir)) return;
    copied.add(dir);

    const target = join(destination, relative(root, dir));
    mkdirSync(dirname(target), { recursive: true });
    cpSync(dir, target, { recursive: true });

    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    for (const dep of Object.keys(manifest.dependencies ?? {})) visit(dep, dir);
    for (const dep of Object.keys(manifest.optionalDependencies ?? {})) {
        try {
            visit(dep, dir);
        } catch {}
    }
}

visit("prisma", resolve("."));
console.log(`copied ${copied.size} packages to ${destination}`);
