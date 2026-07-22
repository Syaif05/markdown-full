"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
} from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

// ── Public ref interface ─────────────────────────────────────────────────
export interface WysiwygRef {
  chain: () => ReturnType<ReturnType<Editor["chain"]>["focus"]>;
  isActive: (name: string, attrs?: Record<string, unknown>) => boolean;
  focus: () => void;
}

interface Props {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  isDark: boolean;
}

// ── Floating BubbleMenu ─────────────────────────────────────────────────
interface BubbleMenuProps {
  editor: Editor;
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
        top: Math.max(10, rect.top - 44),
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
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

// ── WYSIWYG Top Toolbar ─────────────────────────────────────────────────
function WysiwygToolbar({ editor }: { editor: Editor }) {
  const ToolBtn = ({
    label,
    title,
    onClick,
    active = false,
  }: {
    label: string;
    title: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`h-7 px-2.5 rounded-lg text-[11.5px] font-mono font-semibold select-none transition-all duration-100 ${
        active
          ? "bg-[var(--accent)] text-white shadow-sm"
          : "bg-[var(--bg-2)] text-[var(--text-2)] hover:bg-[var(--bg-3)] shadow-[var(--shadow-out-xs)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex-shrink-0 px-4 py-2 flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)]"
      style={{ background: "var(--bg-2)" }}
    >
      <ToolBtn label="B" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} />
      <ToolBtn label="I" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} />
      <ToolBtn label="~~" title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} />
      <ToolBtn label="`" title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} />
      <div className="w-px h-5 mx-1 flex-shrink-0 bg-[var(--border-subtle)]" />
      <ToolBtn label="H1" title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} />
      <ToolBtn label="H2" title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} />
      <ToolBtn label="H3" title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} />
      <div className="w-px h-5 mx-1 flex-shrink-0 bg-[var(--border-subtle)]" />
      <ToolBtn label="• List" title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} />
      <ToolBtn label="1. List" title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} />
      <ToolBtn label="☑ Task" title="Task List" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} />
      <ToolBtn label="❝" title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} />
      <ToolBtn label="```" title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} />
      <div className="w-px h-5 mx-1 flex-shrink-0 bg-[var(--border-subtle)]" />
      <ToolBtn label="Link" title="Insert Link" onClick={() => {
        const url = prompt("Enter URL:", "https://");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }} active={editor.isActive("link")} />
      <ToolBtn label="---" title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <div className="flex-1" />
      <ToolBtn label="↺" title="Undo" onClick={() => editor.chain().focus().undo().run()} />
      <ToolBtn label="↻" title="Redo" onClick={() => editor.chain().focus().redo().run()} />
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
        placeholder: "Write directly here using WYSIWYG rich text format…",
      }),
      Markdown.configure({
        html:                true,
        tightLists:          true,
        bulletListMarker:    "-",
        transformCopiedText: true,
        transformPastedText: true,
      }),
    ],
    content: initialMarkdown,
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown?.getMarkdown?.() ?? editor.getHTML();
      onChange(md);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setBubbleVisible(false), 150);
        return;
      }
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
        class:       "md-preview ProseMirror focus:outline-none min-h-[450px]",
        spellcheck:  "true",
        autocomplete: "off",
      },
    },
  });

  // Sync external changes (e.g. initialMarkdown prop change)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMd = (editor.storage as any).markdown?.getMarkdown?.() ?? "";
    if (initialMarkdown !== currentMd && initialMarkdown !== editor.getHTML()) {
      editor.commands.setContent(initialMarkdown);
    }
  }, [initialMarkdown, editor]);

  // Expose API
  useImperativeHandle(ref, () => ({
    chain: () => editor!.chain().focus() as never,
    isActive: (name, attrs) => editor?.isActive(name, attrs) ?? false,
    focus: () => editor?.commands.focus(),
  }));

  // Cleanup
  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    editor?.destroy();
  }, [editor]);

  // Keyboard shortcut: Escape hides bubble
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setBubbleVisible(false);
  }, []);

  if (!editor) return (
    <div className="h-full flex items-center justify-center font-mono text-sm" style={{ color: "var(--text-3)" }}>
      Loading WYSIWYG editor…
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onKeyDown={handleKeyDown}>
      {/* Top Toolbar */}
      <WysiwygToolbar editor={editor} />

      {/* Custom Floating Bubble Menu */}
      <FloatingBubble editor={editor} visible={bubbleVisible} rect={bubbleRect} />

      {/* Workspace Paper Document Page Container */}
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-8 bg-[var(--bg-2)]">
        <div className="max-w-3xl mx-auto bg-[var(--bg)] shadow-[var(--shadow-out)] rounded-xl p-8 sm:p-12 min-h-[100%] border border-[var(--border-subtle)]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default WysiwygEditor;
