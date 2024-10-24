"use client";

import { useSubmission } from "@/hooks/submission";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function Score({
    submissionId,
    problemScore,
    testcases,
}: {
    submissionId: number;
    problemScore: number;
    testcases: number;
}) {
    const { data, isLoading } = useSubmission(submissionId);

    if (isLoading) {
        return <Skeleton className="h-9" />;
    }

    const { score } = data;

    return (
        <div className="flex flex-col">
            <span className="text-xs">
                {(score * problemScore) /
                    testcases}{" "}
                pts.
            </span>
            <Progress
                className="h-2 w-32"
                value={(score * 100) / testcases}
            />
        </div>
    );
}