import useSWR from "swr";
import { useState, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSubmission(submissionId: number) {
    const [isRunning, setIsRunning] = useState(false);

    const { data, error, isLoading } = useSWR(`/api/submission/${submissionId}`, fetcher, {
        refreshInterval: isRunning ? 500 : 0,
    });

    const { status } = data || {
        status: null,
    };

    useEffect(() => {
        setIsRunning(status !== null);
    }, [status]);

    return {
        data,
        error,
        isLoading,
        isRunning,
    };

}