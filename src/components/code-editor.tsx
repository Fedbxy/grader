"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { type BeforeMount, type Monaco } from "@monaco-editor/react";
import { useIsClient } from "@/hooks/is-client";

// The theme matching the page right now: dark or light from the class
// next-themes puts on <html>.
function pageThemeName() {
  return document.documentElement.classList.contains("dark")
    ? "grader-dark"
    : "grader-light";
}

// Defines that theme from the page and returns its name. The background is
// the page's --background, so the editor reads as part of the page; solid,
// never transparent, as sticky scroll and other overlays reuse it.
function definePageTheme(monaco: Monaco) {
  const name = pageThemeName();
  const background = cssColorToHex(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim(),
  );
  monaco.editor.defineTheme(name, {
    base: name === "grader-dark" ? "vs-dark" : "vs",
    inherit: true,
    rules: [],
    colors: background ? { "editor.background": background } : {},
  });
  return name;
}

// A CSS colour as "#rrggbb", which is all Monaco accepts. The browser does
// the converting: the page's colours are OKLCH in the source but the build
// may emit them as lab(), so a canvas pixel is more reliable than parsing.
// null when the canvas can't read the value.
function cssColorToHex(value: string) {
  const context = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!value || !context) {
    return null;
  }
  const sentinel = "#010203";
  context.fillStyle = sentinel;
  context.fillStyle = value;
  if (context.fillStyle === sentinel) {
    return null;
  }
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

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

  if (language === "py" || language === "pypy") {
    language = "python";
  }

  // The theme follows the class on <html> rather than React state, which is
  // still unresolved while Monaco loads on a first visit. Setting it as the
  // Editor's theme prop matters: the wrapper applies that prop itself and
  // would put its default back over anything set another way.
  const monacoRef = useRef<Monaco | null>(null);
  const [theme, setTheme] = useState<string | null>(null);
  const defineTheme: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    setTheme(definePageTheme(monaco));
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monacoRef.current) {
        definePageTheme(monacoRef.current);
      }
      setTheme(pageThemeName());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Editor
      height="80vh"
      language={language}
      value={code}
      onChange={(value) => onChange && onChange(value ?? "")}
      theme={theme ?? pageThemeName()}
      beforeMount={defineTheme}
      options={{
        readOnly,
        minimap: {
          enabled: false,
        },
      }}
    />
  );
}
