import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      div: [...(defaultSchema.attributes?.div || []), "className"],
      span: [...(defaultSchema.attributes?.span || []), "className", "style"],
      code: ["className"]
    }
  })
  .use(rehypeKatex)
  .use(rehypeStringify);

/**
 * Converts a Markdown string to a safe HTML string.
 * This is a pure function with no side effects.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await processor.process(markdown);
  return String(result);
}

export const DEFAULT_MARKDOWN = `# Welcome to GlassMark ✦

A **clean, modern** Markdown editor built for speed and simplicity.

## Features

- [x] Live split-view preview
- [x] GFM support (tables, strikethrough, task lists)
- [x] Mermaid diagrams
- [x] Math with KaTeX

## Quick Reference

| Syntax       | Result         |
|--------------|----------------|
| \`**bold**\`   | **bold**       |
| \`*italic*\`   | *italic*       |
| \`~~strike~~\` | ~~strike~~     |
| \`\`code\`\`   | \`code\`         |

## Diagram Example (Mermaid)

\`\`\`mermaid
graph TD;
    A[Markdown] --> B(Parser);
    B --> C{Safe HTML?};
    C -->|Yes| D[Live Preview];
    C -->|No| E[Sanitize];
    E --> D;
\`\`\`

## Math Example (KaTeX)

Einstein's mass-energy equivalence is $E = mc^2$.

The quadratic formula is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

> **Tip:** You can drag the center divider to resize the panels.
`;

