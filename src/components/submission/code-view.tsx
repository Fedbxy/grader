import { highlightCode } from "@/lib/highlighter";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";

// A submission's code, read-only. It is highlighted on the server, in both
// themes at once (the colours switch with the `dark` class), so the page
// arrives with the code already coloured and nothing moves when it hydrates.
// A language the highlighter doesn't know is shown as plain text.
export async function CodeView({
  code,
  language,
  title,
}: {
  code: string;
  language: string;
  title: string;
}) {
  // A trailing newline would show as an extra empty line.
  const text = code.endsWith("\n") ? code.slice(0, -1) : code;
  const lines = (await highlightCode(text, language)) ?? text.split("\n");

  return (
    <CodeBlock className="rounded-none border-0">
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      {/* The whole code at its full length: the page (or the modal) scrolls,
          not the block. Only long lines scroll sideways. */}
      <CodeBlockContent lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
