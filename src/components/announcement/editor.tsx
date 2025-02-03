"use client";

import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";

export function AnnouncementEditor({
  content,
  onChange,
  readOnly,
}: {
  content: Content;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
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
      editorClassName="focus:outline-none"
      immediatelyRender={false}
    />
  );
}
