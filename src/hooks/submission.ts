import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSubmission(submissionId: number) {
    const { data, error, isLoading } = useSWR(`/api/submission/${submissionId}`, fetcher, {
        refreshInterval: (latest) => (latest && latest.status !== null ? 500 : 0),
    });

    const { status } = data || {
        status: null,
    };

    const isRunning = status !== null;

    return {
        data,
        error,
        isLoading,
        isRunning,
    };

}