"use server";

import { uploadFile } from "@/lib/minio";
import prisma from "@/lib/prisma";
import { messages } from "@/config/messages";

/**
 * Publish a problem's testcases.
 *
 * MinIO holds the archive; the database holds the version token the judge
 * compares against its local cache. The judge picks the change up on its next
 * submission for this problem, so nothing needs to be notified here.
 */
export async function uploadTestcase(problemId: number, file: File) {
    try {
        const version = await uploadFile(`problem/${problemId}/testcase.zip`, file);

        await prisma.problem.update({
            where: { id: problemId },
            data: { testcaseVersion: version },
        });
    } catch (error) {
        console.error(error);
        return messages.form.unexpected;
    }
}
