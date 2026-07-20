"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import GlassPanel from "@/components/GlassPanel";
import Button3D from "@/components/Button3D";
import { renderMarkdown, DEFAULT_MARKDOWN } from "@/lib/markdownRenderer";

// CodeMirror must be client-only (no SSR)
const CodeMirrorEditor = dynamic(() => import("@/components/CodeMirrorEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-blue-300 text-sm font-mono">
      Loading editor…
    </div>
  ),
});

// ── Toolbar actions ─────────────────────────────────────────────────────────
interface ToolbarBtnProps {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
}
function ToolbarBtn({ label, title, onClick, active }: ToolbarBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`
        h-7 px-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-100 select-none
        ${active
          ? "bg-blue-500 text-white shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]"
          : "text-blue-700 hover:bg-blue-100 active:scale-95"
        }
      `}
    >
      {label}
    </button>
  );
}

// ── Word count util ─────────────────────────────────────────────────────────
function getStats(md: string) {
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;
  const chars = md.length;
  const readMin = Math.max(1, Math.round(words / 200));
  return { words, chars, readMin };
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState("");
  const [mode, setMode] = useState<"split" | "wysiwyg">("split");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // percent
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stats = getStats(markdown);

  // ── Markdown → HTML (debounced) ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      renderMarkdown(markdown).then(setHtml);
    }, 120);
    return () => clearTimeout(timer);
  }, [markdown]);

  // initial render
  useEffect(() => {
    renderMarkdown(DEFAULT_MARKDOWN).then(setHtml);
  }, []);

  // ── Toolbar helpers ──────────────────────────────────────────────────────
  const wrap = useCallback((before: string, after: string = before) => {
    setMarkdown((md) => md + `${before}text${after}`);
  }, []);

  const insert = useCallback((snippet: string) => {
    setMarkdown((md) => md + "\n" + snippet);
  }, []);

  // ── Drag-to-resize divider ───────────────────────────────────────────────
  const onDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── File import ──────────────────────────────────────────────────────────
  const importFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setMarkdown(ev.target?.result as string);
      reader.readAsText(file);
    };
    input.click();
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const copyMarkdown = () => navigator.clipboard.writeText(markdown);
  const copyHtml = () => navigator.clipboard.writeText(html);

  // ── Warn before unload if edited ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (markdown !== DEFAULT_MARKDOWN) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [markdown]);

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-surface-2 selection:bg-blue-200">
      {/* ── NAVBAR ────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-4 py-3 flex items-center justify-between gap-4 bg-white border-b border-blue-100 shadow-[0_2px_10px_rgba(59,110,248,0.07)]">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-[3px_3px_8px_rgba(59,110,248,0.35)]">
            <span className="text-white font-display font-black text-sm">M</span>
          </div>
          <div>
            <span className="font-display font-extrabold text-lg text-ink leading-none">
              GlassMark
            </span>
            <span className="hidden sm:inline ml-2 text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">
              Phase 1
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="relative flex bg-blue-50 rounded-xl p-1 border border-blue-100 shadow-[inset_2px_2px_5px_rgba(59,110,248,0.1),inset_-1px_-1px_4px_rgba(255,255,255,0.8)]">
          {(["split", "wysiwyg"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative z-10 px-4 py-1.5 text-xs font-display font-bold rounded-lg transition-all duration-200 ${
                mode === m
                  ? "bg-blue-500 text-white shadow-[2px_2px_6px_rgba(59,110,248,0.35)]"
                  : "text-blue-400 hover:text-blue-600"
              }`}
            >
              {m === "split" ? "Split View" : "WYSIWYG"}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            title="Import .md file"
            onClick={importFile}
            className="h-8 px-3 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            Import
          </button>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="h-8 px-3 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            {sidebarOpen ? "Hide" : "Tools"}
          </button>
          <Button3D variant="primary" size="sm">
            Export
          </Button3D>
        </div>
      </header>

      {/* ── TOOLBAR ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-1.5 bg-white border-b border-blue-50 flex items-center gap-1 overflow-x-auto">
        <ToolbarBtn label="B" title="Bold (Ctrl+B)" onClick={() => wrap("**")} />
        <ToolbarBtn label="I" title="Italic (Ctrl+I)" onClick={() => wrap("*")} />
        <ToolbarBtn label="~~" title="Strikethrough" onClick={() => wrap("~~")} />
        <ToolbarBtn label="`" title="Inline Code" onClick={() => wrap("`")} />
        <div className="w-px h-5 bg-blue-100 mx-1 flex-shrink-0" />
        <ToolbarBtn label="H1" title="Heading 1" onClick={() => insert("# Heading")} />
        <ToolbarBtn label="H2" title="Heading 2" onClick={() => insert("## Heading")} />
        <ToolbarBtn label="H3" title="Heading 3" onClick={() => insert("### Heading")} />
        <div className="w-px h-5 bg-blue-100 mx-1 flex-shrink-0" />
        <ToolbarBtn label="• List" title="Bullet list" onClick={() => insert("- Item")} />
        <ToolbarBtn label="1. List" title="Ordered list" onClick={() => insert("1. Item")} />
        <ToolbarBtn label="☑ Task" title="Task list" onClick={() => insert("- [ ] Task")} />
        <ToolbarBtn label="❝" title="Blockquote" onClick={() => insert("> Quote")} />
        <div className="w-px h-5 bg-blue-100 mx-1 flex-shrink-0" />
        <ToolbarBtn label="Link" title="Insert link" onClick={() => insert("[Label](url)")} />
        <ToolbarBtn label="Img" title="Insert image" onClick={() => insert("![Alt](url)")} />
        <ToolbarBtn label="Table" title="Insert table" onClick={() => insert("| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |")} />
        <ToolbarBtn label="---" title="Horizontal rule" onClick={() => insert("---")} />
        <ToolbarBtn label="```" title="Code block" onClick={() => insert("```js\ncode here\n```")} />
        <div className="flex-1" />
        <button
          onClick={copyMarkdown}
          className="h-7 px-2.5 rounded-lg text-[11px] font-semibold text-blue-500 hover:bg-blue-50 transition-colors"
          title="Copy raw Markdown"
        >
          Copy MD
        </button>
        <button
          onClick={copyHtml}
          className="h-7 px-2.5 rounded-lg text-[11px] font-semibold text-blue-500 hover:bg-blue-50 transition-colors"
          title="Copy rendered HTML"
        >
          Copy HTML
        </button>
      </div>

      {/* ── WORKSPACE ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main editor area */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden">
          {mode === "split" ? (
            <>
              {/* Left: CodeMirror editor */}
              <div
                className="flex flex-col overflow-hidden border-r border-blue-100"
                style={{ width: `${leftWidth}%` }}
              >
                <div className="flex-shrink-0 px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                    Markdown Source
                  </span>
                </div>
                <div className="flex-1 overflow-hidden bg-white">
                  <CodeMirrorEditor value={markdown} onChange={setMarkdown} />
                </div>
              </div>

              {/* Divider */}
              <div
                className="resize-divider hover:bg-blue-400 transition-colors"
                onMouseDown={onDividerMouseDown}
              />

              {/* Right: Preview */}
              <div
                className="flex flex-col overflow-hidden"
                style={{ width: `${100 - leftWidth}%` }}
              >
                <div className="flex-shrink-0 px-4 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                    Live Preview
                  </span>
                  <span className="text-[10px] text-blue-300 font-semibold">GFM ✓</span>
                </div>
                <div className="flex-1 overflow-auto bg-white px-8 py-6">
                  <div
                    className="md-preview max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* WYSIWYG mode — full-width editor centered */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 py-1.5 bg-blue-50 border-b border-blue-100">
                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                  WYSIWYG Editor
                </span>
              </div>
              <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-3xl mx-auto py-8 px-4">
                  <CodeMirrorEditor value={markdown} onChange={setMarkdown} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <div
          className={`flex-shrink-0 flex flex-col bg-white border-l border-blue-100 overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <div className="flex-shrink-0 px-4 py-3 border-b border-blue-100">
            <h2 className="font-display font-bold text-sm text-ink">Cheatsheet</h2>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {[
              { name: "Bold", syntax: "**text**" },
              { name: "Italic", syntax: "*text*" },
              { name: "Strikethrough", syntax: "~~text~~" },
              { name: "Heading 1", syntax: "# Title" },
              { name: "Heading 2", syntax: "## Title" },
              { name: "Link", syntax: "[Label](url)" },
              { name: "Image", syntax: "![Alt](url)" },
              { name: "Code Inline", syntax: "`code`" },
              { name: "Code Block", syntax: "```js\ncode\n```" },
              { name: "Blockquote", syntax: "> quote" },
              { name: "Bullet List", syntax: "- item" },
              { name: "Ordered List", syntax: "1. item" },
              { name: "Task List", syntax: "- [ ] task" },
              { name: "Table", syntax: "| A | B |\n|---|---|\n| 1 | 2 |" },
              { name: "Horizontal Rule", syntax: "---" },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setMarkdown((md) => md + "\n" + item.syntax)}
                className="w-full text-left p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 transition-all group"
              >
                <div className="text-xs font-semibold text-ink mb-1">{item.name}</div>
                <code className="text-[10px] text-blue-500 font-mono whitespace-pre-line leading-tight block">
                  {item.syntax}
                </code>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATUS BAR ────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 px-5 py-1.5 bg-white border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-400 font-medium">
        <div className="flex items-center gap-5">
          <span>Words: <strong className="text-ink-2">{stats.words}</strong></span>
          <span>Chars: <strong className="text-ink-2">{stats.chars}</strong></span>
          <span>~{stats.readMin} min read</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live
          </span>
          <span>UTF-8</span>
          <span>Markdown</span>
        </div>
      </footer>
    </main>
  );
}
