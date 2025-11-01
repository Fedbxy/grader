import { notFound } from "next/navigation";
import { getProblemData } from "@/utils/problem";

import { SubmitForm } from "../form";

export default async function Page({ params }: { params: { id: string } }) {
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem, user, latestCode, latestLanguage } = await getProblemData(
    Number(params.id),
  );

  return (
    <SubmitForm
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
      problemId={problem.id}
      latestCode={latestCode}
      latestLanguage={latestLanguage}
      disabled={!user}
    />
  );
}
