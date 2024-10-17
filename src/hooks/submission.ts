import useSWR from "swr";
import { useState, useEffect } from "react";
import { maps } from "@/config/messages";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSubmission(submissionId: number) {
    const [isRunning, setIsRunning] = useState(false);

    const { data, error, isLoading } = useSWR(`/api/submission/${submissionId}`, fetcher, {
        refreshInterval: isRunning ? 100 : 0,
    });

    const { verdict } = data || {
        verdict: [],
    };

    useEffect(() => {
        setIsRunning(verdict.length === 1 && !(verdict[0] in maps.submission.verdict));
    }, [verdict]);

    return {
        data,
        error,
        isLoading,
        isRunning,
    };

}