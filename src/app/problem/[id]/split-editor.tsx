import { Language } from "@/types/submission";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SubmitForm } from "./form";
import { Statement } from "./statement";

export function SplitEditor({
  problemId,
  latestCode,
  latestLanguage,
  formDisabled,
}: {
  problemId: number;
  latestCode: string;
  latestLanguage?: Language;
  formDisabled?: boolean;
}) {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="mr-4">
        <Statement problemId={problemId} withSplitLayout />
      </ResizablePanel>
      <ResizableHandle withHandle className="z-20" />
      <ResizablePanel className="ml-4">
        <SubmitForm
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string}
          problemId={problemId}
          latestCode={latestCode}
          latestLanguage={latestLanguage}
          disabled={formDisabled}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
