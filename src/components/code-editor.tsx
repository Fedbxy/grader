"use client";

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/is-client";
import { useState } from "react";

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
  const isMounted = useIsClient();
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";
  // Read-only code is sized to fit it (between 10 lines and 70% of the
  // window), so a short submission doesn't sit in a mostly empty box. The
  // writing editor keeps its fixed height.
  const [fitHeight, setFitHeight] = useState<number>();

  if (language === "py" || language === "pypy") {
    language = "python";
  }

  function handleEditorMount(editor: any, monaco: any) {
    editor.updateOptions({
      theme: editorTheme,
    });

    if (readOnly) {
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const fit = () =>
        setFitHeight(
          Math.min(
            Math.max(editor.getContentHeight(), lineHeight * 10),
            window.innerHeight * 0.7,
          ),
        );
      editor.onDidContentSizeChange(fit);
      fit();
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Editor
      height={readOnly ? (fitHeight ?? "70vh") : "80vh"}
      language={language}
      value={code}
      onChange={(value) => onChange && onChange(value ?? "")}
      onMount={handleEditorMount}
      options={{
        theme: editorTheme,
        readOnly,
        scrollBeyondLastLine: !readOnly,
        minimap: {
          enabled: false,
        },
      }}
    />
  );
}
