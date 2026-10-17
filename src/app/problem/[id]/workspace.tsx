"use client";

import { useState } from "react";
import { useDefaultLayout, useGroupRef } from "react-resizable-panels";
import { useMediaQuery } from "@/hooks/media-query";
import { Language } from "@/types/submission";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CodePane } from "./code-pane";
import { Statement } from "./statement";
import { useWorkspace } from "./use-workspace";
import { layoutStorage, TAB_TOOLBAR } from "./strips";

// A pane stays mounted while another tab shows, so the statement doesn't
// reload and the code, its undo history and the run keep their place.
const PANE = "min-h-0 flex-1 data-[state=inactive]:hidden";

// The part of the problem page below its header: the statement and the
// problem's submissions on the left, the code on the right (md and up), or the
// three as tabs on a phone.
export function Workspace({
  problemId,
  siteKey,
  latestCode,
  latestLanguage,
  disabled,
  initialRun,
  viewerId,
  submissions,
}: {
  problemId: number;
  siteKey: string;
  latestCode: string;
  latestLanguage?: Language;
  disabled?: boolean;
  initialRun?: { id: number; input: string };
  viewerId?: number;
  // Rendered by the server page: the table of this problem's submissions.
  submissions: React.ReactNode;
}) {
  const workspace = useWorkspace({
    problemId,
    latestCode,
    latestLanguage,
    disabled,
    initialRun,
    viewerId,
  });
  const isDesktop = useMediaQuery("(min-width: 48rem)");
  // The statement/code split, as the viewer last left it.
  const layout = useDefaultLayout({ id: "workspace", storage: layoutStorage });
  const mainGroup = useGroupRef();
  const [leftTab, setLeftTab] = useState("statement");
  const [phoneTab, setPhoneTab] = useState("statement");

  const statement = <Statement problemId={problemId} />;
  const submissionList = (
    <div className="h-full overflow-auto p-3">{submissions}</div>
  );
  const code = (
    <CodePane
      workspace={workspace}
      problemId={problemId}
      siteKey={siteKey}
      resizable={isDesktop === true}
      // Reset layout: the statement/code split's half.
      onResetLayout={() =>
        mainGroup.current?.setLayout({ "statement-side": 50, "code-side": 50 })
      }
    />
  );

  // Ctrl+Enter or Cmd+Enter runs from anywhere in the workspace. Monaco has
  // its own binding for it, since it would otherwise insert a line.
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      workspace.run.start();
    }
  }

  if (isDesktop === null) {
    return <Skeleton className="min-h-0 flex-1 rounded-none" />;
  }

  return (
    <div
      // Not a card: the panes run edge to edge under a rule, as part of
      // the page.
      className="min-h-0 flex-1 overflow-hidden border-t"
      onKeyDown={handleKeyDown}
    >
      {isDesktop ? (
        <ResizablePanelGroup
          orientation="horizontal"
          defaultLayout={layout.defaultLayout}
          onLayoutChanged={layout.onLayoutChanged}
          groupRef={mainGroup}
        >
          <ResizablePanel id="statement-side" minSize="25%">
            <Tabs
              value={leftTab}
              onValueChange={setLeftTab}
              className="h-full gap-0"
            >
              <div className={TAB_TOOLBAR}>
                <TabsList variant="line" className="h-full!">
                  <TabsTrigger value="statement">Statement</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="statement" forceMount className={PANE}>
                {statement}
              </TabsContent>
              <TabsContent value="submissions" forceMount className={PANE}>
                {submissionList}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle className="z-20" />
          <ResizablePanel id="code-side" minSize="25%">
            {code}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <Tabs
          value={phoneTab}
          onValueChange={setPhoneTab}
          className="h-full gap-0"
        >
          <div className={TAB_TOOLBAR}>
            <TabsList variant="line" className="h-full!">
              <TabsTrigger value="statement">Statement</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="statement" forceMount className={PANE}>
            {statement}
          </TabsContent>
          <TabsContent value="code" forceMount className={PANE}>
            {code}
          </TabsContent>
          <TabsContent value="submissions" forceMount className={PANE}>
            {submissionList}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
