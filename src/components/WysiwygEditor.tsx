"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

// ── Sync Markdown → HTML for editor init ────────────────────────────────
function mdToHtml(md: string): string {
  try {
    return String(
      unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeStringify)
        .processSync(md)
    );
  } catch {
    return `<p>${md.slice(0, 200)}</p>`;
  }
}

// ── Public ref interface ─────────────────────────────────────────────────
export interface WysiwygRef {
  chain: () => ReturnType<ReturnType<import("@tiptap/core").Editor["chain"]>["focus"]>;
  isActive: (name: string, attrs?: Record<string, unknown>) => boolean;
  focus: () => void;
}

interface Props {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  isDark: boolean;
}

// ── Floating BubbleMenu (custom, no @tiptap/extension-bubble-menu) ───────
interface BubbleMenuProps {
  editor: import("@tiptap/core").Editor;
  visible: boolean;
  rect: DOMRect | null;
}

function FloatingBubble({ editor, visible, rect }: BubbleMenuProps) {
  if (!visible || !rect) return null;

  const items = [
    { label: "B",  title: "Bold",       run: () => editor.chain().focus().toggleBold().run(),               active: editor.isActive("bold")            },
    { label: "I",  title: "Italic",     run: () => editor.chain().focus().toggleItalic().run(),             active: editor.isActive("italic")          },
    { label: "~~", title: "Strike",     run: () => editor.chain().focus().toggleStrike().run(),             active: editor.isActive("strike")          },
    { label: "`",  title: "Code",       run: () => editor.chain().focus().toggleCode().run(),               active: editor.isActive("code")            },
    null,
    { label: "H1", title: "Heading 1",  run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),active: editor.isActive("heading", { level: 1 }) },
    { label: "H2", title: "Heading 2",  run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),active: editor.isActive("heading", { level: 2 }) },
    { label: "H3", title: "Heading 3",  run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),active: editor.isActive("heading", { level: 3 }) },
    null,
    { label: "🔗", title: "Link",       run: () => {
      const url = prompt("Enter URL:", "https://");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }, active: editor.isActive("link") },
  ];

  return (
    <div
      className="bubble-menu"
      style={{
        position: "fixed",
        top: rect.top - 44,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
      // Prevent editor blur on click
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="bubble-sep" />
        ) : (
          <button
            key={item.label}
            onClick={item.run}
            title={item.title}
            className={`bubble-btn ${item.active ? "is-active" : ""}`}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════
const WysiwygEditor = forwardRef<WysiwygRef, Props>(function WysiwygEditor(
  { initialMarkdown, onChange, isDark },
  ref
) {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading:   { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "wysiwyg-codeblock" } },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "wysiwyg-link" },
      }),
      Placeholder.configure({
        placeholder: "Start writing… (select text for formatting options)",
      }),
      Markdown.configure({
        html:                false,
        tightLists:          true,
        bulletListMarker:    "-",
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    content: mdToHtml(initialMarkdown),
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
      onChange(md);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        // No selection → hide bubble
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setBubbleVisible(false), 150);
        return;
      }
      // Has selection → show bubble
      if (hideTimer.current) clearTimeout(hideTimer.current);
      try {
        const domSel = window.getSelection();
        if (domSel && domSel.rangeCount > 0) {
          const rect = domSel.getRangeAt(0).getBoundingClientRect();
          if (rect.width > 0) {
            setBubbleRect(rect);
            setBubbleVisible(true);
          }
        }
      } catch {
        /* ignore */
      }
    },
    onBlur: () => {
      hideTimer.current = setTimeout(() => setBubbleVisible(false), 200);
    },
    onFocus: () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    editorProps: {
      attributes: {
        class:       "wysiwyg-content",
        spellcheck:  "true",
        autocomplete: "off",
      },
    },
  });

  // ── Expose API ──────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    chain: () => editor!.chain().focus() as never,
    isActive: (name, attrs) => editor?.isActive(name, attrs) ?? false,
    focus: () => editor?.commands.focus(),
  }));

  // ── Cleanup ─────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    editor?.destroy();
  }, [editor]);

  // ── Keyboard shortcut: Escape hides bubble ──────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setBubbleVisible(false);
  }, []);

  if (!editor) return (
    <div className="h-full flex items-center justify-center" style={{ color: "var(--text-3)" }}>
      Initializing editor…
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onKeyDown={handleKeyDown}>
      {/* ── Custom Floating Bubble Menu ──────────────────────────── */}
      <FloatingBubble editor={editor} visible={bubbleVisible} rect={bubbleRect} />

      {/* ── Editor Content ─────────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto"
        style={{ background: "var(--bg-2)" }}
      />
    </div>
  );
});

export default WysiwygEditor;
