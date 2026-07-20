import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      div: [...(defaultSchema.attributes?.div || []), "className"],
      span: [...(defaultSchema.attributes?.span || []), "className"]
    }
  })
  .use(rehypeKatex)
  .use(rehypeStringify);

console.log(processor.processSync("Inline math: $E=mc^2$ \n\nBlock math:\n$$a^2 + b^2 = c^2$$").toString());
