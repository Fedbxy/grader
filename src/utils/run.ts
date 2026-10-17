import prisma from "@/lib/prisma";
import { limits } from "@/config/limits";

// The user's run, if it was on this problem and hasn't expired, for the run
// panel to pick up again after a reload (still polling if it's queued). Runs
// are one per user, so a run on another problem means none here.
export async function getLastRun(userId: number, problemId: number) {
    const run = await prisma.run.findUnique({
        where: { userId },
        select: { id: true, problemId: true, input: true, createdAt: true },
    });
    const expiresAt = Date.now() - limits.run.ttlMinutes * 60 * 1000;
    if (!run || run.problemId !== problemId || run.createdAt.getTime() < expiresAt) {
        return undefined;
    }
    return { id: run.id, input: run.input };
}
