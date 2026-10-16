import Decimal from "decimal.js";

// A submission's score and result.scores are counts of passed cases, not
// points. The weighting is applied when displaying rather than stored, so that
// changing a problem's score or a subtask's weight needs no rejudge.
//
// Returns the earned and total weight; earned / total is the fraction of the
// problem's score the submission earned.
export function scoreFraction(
    score: number,
    result: unknown,
    testcases: number,
): { earned: Decimal; total: Decimal } {
    const { weights, verdicts, scores } = (result ?? {}) as {
        weights?: number[];
        verdicts?: string[][];
        scores?: number[];
    };

    if (weights?.length && verdicts?.length && scores?.length) {
        return {
            total: new Decimal(weights.reduce((a, b) => a + b, 0)),
            earned: scores.reduce(
                (sum, passed, i) => sum.plus(new Decimal(passed).div(verdicts[i].length || 1).mul(weights[i])),
                new Decimal(0),
            ),
        };
    }

    // No subtasks recorded (or an errored submission): cases are the weights.
    return { total: new Decimal(testcases || 1), earned: new Decimal(score) };
}

// The points shown for a fraction of a problem's score, rounded once.
export function displayPoints(earned: Decimal, total: Decimal, problemScore: number): number {
    return earned.div(total).mul(problemScore).toDecimalPlaces(2).toNumber();
}

/**
 * Convert a subtask's passed-case count into displayed points.
 *
 * result.scores[i] is a count of cases, not points: the weighting lives here so
 * that changing a problem's max score never requires a rejudge. Rounded once,
 * at the end — rounding subtaskFullScore first and then multiplying by it
 * compounds the error.
 */
export function subtaskDisplay(
    passed: number,
    caseCount: number,
    subtaskWeight: number,
    totalWeight: number,
    problemScore: number,
) {
    const full = new Decimal(subtaskWeight).div(totalWeight).mul(problemScore);
    const earned = new Decimal(passed).div(caseCount || 1).mul(full);

    return {
        subtaskScore: earned.toDecimalPlaces(2).toNumber(),
        subtaskFullScore: full.toDecimalPlaces(2).toNumber(),
    };
}
