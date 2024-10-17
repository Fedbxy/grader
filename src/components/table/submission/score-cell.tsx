import { useSubmission } from "@/hooks/submission";

import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/spinner";

export function ScoreCell({
    submissionId,
    problemScore,
    testcases,
}: {
    submissionId: number;
    problemScore: number;
    testcases: number;
}) {
    const { data, isLoading, isRunning } = useSubmission(submissionId);

    if (isLoading) {
        return null;
    }

    const { score, verdict } = data;

    if (isRunning) {
        return (
            <span className="flex items-center">
                <LoadingSpinner className="mr-1 h-4 w-4" />
                {verdict[0]}
            </span>
        );
    }

    return (
        <div className="flex flex-col">
            <span>{(score * problemScore) / testcases} pts.</span>
            <Progress
                className="h-2 w-16 md:w-32"
                value={(score * 100) / testcases}
            />
        </div>
    );
}