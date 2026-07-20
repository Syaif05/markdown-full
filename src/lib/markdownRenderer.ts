import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize)
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
- [ ] Mermaid diagrams *(coming in Phase 3)*
- [ ] Math with KaTeX *(coming in Phase 3)*

## Quick Reference

| Syntax       | Result         |
|--------------|----------------|
| \`**bold**\`   | **bold**       |
| \`*italic*\`   | *italic*       |
| \`~~strike~~\` | ~~strike~~     |
| \`\`code\`\`   | \`code\`         |

## Code Example

\`\`\`javascript
// GlassMark — fully client-side
const editor = {
  mode: "split-view",
  parser: "remark + rehype",
  ready: true,
};
\`\`\`

> **Tip:** You can drag the center divider to resize the panels.

---

*Start typing in the left panel to see your Markdown rendered live on the right.*
`;
