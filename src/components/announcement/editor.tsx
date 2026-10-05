"use client";

import { Content } from "@tiptap/react";

import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsClient } from "@/hooks/is-client";

export function AnnouncementEditor({
  content,
  onChange,
  readOnly,
}: {
  content: Content;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <MinimalTiptapEditor
      value={content}
      onChange={(value) => onChange && onChange(String(value))}
      className={`w-full ${readOnly && "border-none shadow-none"}`}
      editorContentClassName={`${!readOnly && "p-5"}`}
      output="html"
      placeholder="Write your announcement here..."
      autofocus={true}
      editable={!readOnly}
      editorClassName="focus:outline-hidden"
      immediatelyRender={false}
    />
  );
}
