"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

export function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
}: {
  code: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  if (language === "py") {
    language = "python";
  }

  return (
    <Editor
      height="80vh"
      language={language}
      value={code}
      onChange={(value) => onChange && onChange(value ?? "")}
      options={{
        theme: editorTheme,
        readOnly,
        minimap: {
          enabled: false,
        },
      }}
    />
  );
}
