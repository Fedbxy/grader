"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  if (language === "py") {
    language = "python";
  }

  function handleEditorMount(editor: any) {
    editor.updateOptions({
      theme: editorTheme,
    });
  }

  return (
    <Editor
      height="80vh"
      language={language}
      value={code}
      onChange={(value) => onChange && onChange(value ?? "")}
      onMount={handleEditorMount}
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
