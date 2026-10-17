import useSWR from "swr";
import { RunResult } from "@/types/run";

// Throws on a 404 (someone else's run, or one already deleted after
// limits.run.ttlMinutes) so SWR reports an error instead of polling forever.
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`GET ${url}: ${res.status}`);
    }
    return res.json();
};

// Polls a run until the judge finishes it, like useSubmission.
export function useRun(runId: number | null) {
    const { data, error, isLoading } = useSWR<RunResult>(
        runId === null ? null : `/api/run/${runId}`,
        fetcher,
        {
            refreshInterval: (latest) => (latest && latest.status !== null ? 500 : 0),
        },
    );

    return {
        data,
        error,
        isLoading,
        isRunning: runId !== null && (!data || data.status !== null),
    };
}
