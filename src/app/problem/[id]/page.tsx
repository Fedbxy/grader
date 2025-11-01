import { notFound } from "next/navigation";
import { getProblemData } from "@/utils/problem";

import { SubmitForm } from "./form";
import { Statement } from "./statement";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export default async function Page({ params }: { params: { id: string } }) {
  if (isNaN(Number(params.id))) {
    notFound();
  }

  const { problem, user, latestCode, latestLanguage } = await getProblemData(
    Number(params.id),
  );

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="mr-4">
        <Statement problemId={problem.id} withSplitLayout />
      </ResizablePanel>
      <ResizableHandle withHandle className="z-20" />
      <ResizablePanel className="ml-4">
        <SubmitForm
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
          problemId={problem.id}
          latestCode={latestCode}
          latestLanguage={latestLanguage}
          disabled={!user}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
