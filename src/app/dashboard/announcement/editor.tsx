"use client";

import { useState } from "react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";

export function Editor() {
  const [value, setValue] = useState<Content>("");

  return (
    <MinimalTiptapEditor
      value={value}
      onChange={setValue}
      className="w-full"
      editorContentClassName="p-5"
      output="html"
      placeholder="Write your announcement here..."
      autofocus={true}
      editable={true}
      editorClassName="focus:outline-none"
      immediatelyRender={false}
    />
  );
}
