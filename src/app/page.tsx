"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import GlassPanel from "@/components/GlassPanel";
import Button3D from "@/components/Button3D";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { renderMarkdown, DEFAULT_MARKDOWN } from "@/lib/markdownRenderer";

const CodeMirrorEditor = dynamic(() => import("@/components/CodeMirrorEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center gap-2 text-[var(--text-3)] text-sm font-mono">
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      Loading editor…
    </div>
  ),
});

// ── Stats util ───────────────────────────────────────────────────────────
function getStats(md: string) {
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;
  return { words, chars: md.length, readMin: Math.max(1, Math.round(words / 200)) };
}

// ── Toolbar button ───────────────────────────────────────────────────────
function ToolBtn({
  label, title, onClick, wide = false,
}: { label: string; title: string; onClick: () => void; wide?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        "h-7 rounded-lg text-[11.5px] font-mono font-semibold select-none",
        "text-[var(--text-2)] hover:text-[var(--accent)]",
        "transition-all duration-100",
        "shadow-[var(--shadow-out-xs)] bg-[var(--bg-2)]",
        "hover:shadow-[var(--shadow-out-sm)] hover:bg-[var(--bg-3)]",
        "active:scale-[0.93] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]",
        wide ? "px-3" : "px-2.5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ── Mode pill toggle ─────────────────────────────────────────────────────
function ModePill({
  mode, setMode,
}: { mode: "split" | "wysiwyg"; setMode: (m: "split" | "wysiwyg") => void }) {
  return (
    <div className="relative flex p-1 rounded-xl neu-in-sm">
      {/* Sliding pill */}
      <div
        className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
        style={{
          left:  mode === "split" ? "4px"   : "calc(50% + 2px)",
          width: "calc(50% - 6px)",
          background: "var(--accent)",
          boxShadow: "var(--shadow-accent)",
        }}
      />
      {(["split", "wysiwyg"] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={[
            "relative z-10 flex-1 py-1.5 px-4 text-xs font-display font-bold",
            "rounded-lg transition-colors duration-200 select-none",
            mode === m ? "text-white" : "text-[var(--text-2)] hover:text-[var(--text-1)]",
          ].join(" ")}
        >
          {m === "split" ? "Split View" : "WYSIWYG"}
        </button>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { isDark } = useTheme();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml]         = useState("");
  const [mode, setMode]         = useState<"split" | "wysiwyg">("split");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftWidth, setLeftWidth]     = useState(50); // %
  const [copied, setCopied]           = useState<"" | "md" | "html">("");

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging   = useRef(false);
  const stats        = getStats(markdown);

  // ── Live preview (debounced 100ms) ───────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { renderMarkdown(markdown).then(setHtml); }, 100);
    return () => clearTimeout(t);
  }, [markdown]);

  useEffect(() => { renderMarkdown(DEFAULT_MARKDOWN).then(setHtml); }, []);

  // ── Toolbar helpers ──────────────────────────────────────────────────
  const wrap   = useCallback((b: string, a = b) => setMarkdown(m => m + `${b}text${a}`), []);
  const insert = useCallback((s: string) => setMarkdown(m => m + "\n" + s), []);

  // ── Draggable divider ────────────────────────────────────────────────
  const onDividerDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct  = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(80, Math.max(20, pct)));
    };
    const up = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  // ── File import ──────────────────────────────────────────────────────
  const importFile = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".md,.markdown,.txt";
    inp.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      new FileReader().addEventListener("load", (ev) => setMarkdown(ev.target?.result as string));
      const r = new FileReader(); r.onload = (ev) => setMarkdown(ev.target?.result as string); r.readAsText(f);
    };
    inp.click();
  };

  // ── Copy ─────────────────────────────────────────────────────────────
  const copy = (type: "md" | "html") => {
    navigator.clipboard.writeText(type === "md" ? markdown : html);
    setCopied(type);
    setTimeout(() => setCopied(""), 1800);
  };

  // ── Beforeunload ─────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (markdown !== DEFAULT_MARKDOWN) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [markdown]);

  // ── Panel label shared ────────────────────────────────────────────────
  const PaneLabel = ({ text, badge }: { text: string; badge?: string }) => (
    <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between border-b border-[var(--border-subtle)]"
      style={{ background: "var(--ed-gutter-bg)" }}>
      <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-3)]">
        {text}
      </span>
      {badge && (
        <span className="text-[10px] text-[var(--accent)] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(120,121,241,0.10)" }}>
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <main className="h-screen flex flex-col overflow-hidden theme-transition"
      style={{ background: "var(--bg)" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════ */}
      <GlassPanel glass radius="sm"
        className="flex-shrink-0 z-50 px-5 py-3 flex items-center gap-4 border-b border-[var(--border)]"
        style={{ borderRadius: 0 }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mr-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-base select-none"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-lav) 100%)",
              boxShadow: "var(--shadow-accent)",
            }}>
            M
          </div>
          <div>
            <div className="font-display font-extrabold text-[15px] tracking-tight leading-none"
              style={{ color: "var(--text-1)" }}>
              GlassMark
            </div>
            <div className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>
              Markdown Editor
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <ModePill mode={mode} setMode={setMode} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={importFile}
            title="Import .md file"
            className="h-9 px-4 text-xs font-semibold rounded-xl theme-transition
              text-[var(--text-2)] hover:text-[var(--text-1)]
              shadow-[var(--shadow-out-sm)] bg-[var(--bg-2)]
              hover:shadow-[var(--shadow-out)] hover:bg-[var(--bg-3)]
              active:scale-[0.96] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]
              transition-all duration-150"
          >
            Import
          </button>

          <button
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle cheatsheet sidebar"
            className={[
              "h-9 px-4 text-xs font-semibold rounded-xl theme-transition transition-all duration-150",
              sidebarOpen
                ? "text-white shadow-[var(--shadow-accent)] active:shadow-[var(--shadow-accent-in)]"
                : "text-[var(--text-2)] hover:text-[var(--text-1)] shadow-[var(--shadow-out-sm)] hover:shadow-[var(--shadow-out)]",
              "bg-[var(--bg-2)] hover:bg-[var(--bg-3)] active:scale-[0.96] active:bg-[var(--bg)]",
            ].join(" ")}
            style={sidebarOpen ? { background: "var(--accent)" } : {}}
          >
            Cheatsheet
          </button>

          <ThemeToggle />

          <Button3D variant="accent" size="sm">
            Export
          </Button3D>
        </div>
      </GlassPanel>

      {/* ══ TOOLBAR ══════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] theme-transition"
        style={{ background: "var(--bg-2)" }}>
        <ToolBtn label="B"  title="Bold"        onClick={() => wrap("**")} />
        <ToolBtn label="I"  title="Italic"       onClick={() => wrap("*")} />
        <ToolBtn label="~~" title="Strikethrough" onClick={() => wrap("~~")} />
        <ToolBtn label="`"  title="Inline code"  onClick={() => wrap("`")} />
        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border-subtle)" }} />
        <ToolBtn label="H1" title="Heading 1"    onClick={() => insert("# ")} />
        <ToolBtn label="H2" title="Heading 2"    onClick={() => insert("## ")} />
        <ToolBtn label="H3" title="Heading 3"    onClick={() => insert("### ")} />
        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border-subtle)" }} />
        <ToolBtn label="• List"  title="Bullet list"   onClick={() => insert("- Item")} wide />
        <ToolBtn label="1. List" title="Ordered list"  onClick={() => insert("1. Item")} wide />
        <ToolBtn label="☑ Task"  title="Task list"     onClick={() => insert("- [ ] Task")} wide />
        <ToolBtn label="❝"       title="Blockquote"    onClick={() => insert("> Quote")} />
        <div className="w-px h-5 mx-1 flex-shrink-0" style={{ background: "var(--border-subtle)" }} />
        <ToolBtn label="Link"  title="Insert link"  onClick={() => insert("[Label](url)")} wide />
        <ToolBtn label="Img"   title="Insert image" onClick={() => insert("![Alt](url)")} wide />
        <ToolBtn label="Table" title="Insert table" onClick={() => insert("| Col 1 | Col 2 |\n|-------|-------|\n| A     | B     |")} wide />
        <ToolBtn label="---"   title="Horizontal rule" onClick={() => insert("---")} />
        <ToolBtn label="```"   title="Code block"   onClick={() => insert("```js\ncode\n```")} />

        <div className="flex-1" />

        {/* Copy buttons */}
        <button
          onClick={() => copy("md")}
          title="Copy raw Markdown"
          className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95"
          style={{ color: copied === "md" ? "var(--accent-teal)" : "var(--text-3)" }}>
          {copied === "md" ? "✓ Copied" : "Copy MD"}
        </button>
        <button
          onClick={() => copy("html")}
          title="Copy rendered HTML"
          className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95"
          style={{ color: copied === "html" ? "var(--accent-teal)" : "var(--text-3)" }}>
          {copied === "html" ? "✓ Copied" : "Copy HTML"}
        </button>
      </div>

      {/* ══ WORKSPACE ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Main editor area ────────────────────────────────────────── */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden">
          {mode === "split" ? (
            <>
              {/* Left: CodeMirror */}
              <div className="flex flex-col overflow-hidden border-r border-[var(--border-subtle)]"
                style={{ width: `${leftWidth}%` }}>
                <PaneLabel text="Markdown Source" badge="Editor" />
                <div className="flex-1 overflow-hidden" style={{ background: "var(--ed-bg)" }}>
                  <CodeMirrorEditor value={markdown} onChange={setMarkdown} isDark={isDark} />
                </div>
              </div>

              {/* Divider */}
              <div className="resize-divider" onMouseDown={onDividerDown} />

              {/* Right: Preview */}
              <div className="flex flex-col overflow-hidden"
                style={{ width: `${100 - leftWidth}%`, background: "var(--bg-2)" }}>
                <PaneLabel text="Live Preview" badge="GFM ✓" />
                <div className="flex-1 overflow-auto px-8 py-6">
                  <div
                    className="md-preview max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* WYSIWYG */
            <div className="flex-1 flex flex-col overflow-hidden">
              <PaneLabel text="WYSIWYG Editor" badge="Direct Edit" />
              <div className="flex-1 overflow-hidden" style={{ background: "var(--ed-bg)" }}>
                <div className="h-full max-w-3xl mx-auto">
                  <CodeMirrorEditor value={markdown} onChange={setMarkdown} isDark={isDark} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar / Cheatsheet ─────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out border-l border-[var(--border-subtle)]"
          style={{
            width: sidebarOpen ? "272px" : "0px",
            background: "var(--bg-2)",
          }}>
          <div className="w-[272px] flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span className="font-display font-bold text-sm" style={{ color: "var(--text-1)" }}>
                Cheatsheet
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-3)] transition-colors text-base leading-none"
              >×</button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {[
                { name: "Bold",          syntax: "**text**",                  color: "var(--accent)" },
                { name: "Italic",        syntax: "*text*",                    color: "var(--accent-lav)" },
                { name: "Strikethrough", syntax: "~~text~~",                  color: "var(--text-3)" },
                { name: "Heading 1",     syntax: "# Title",                   color: "var(--accent)" },
                { name: "Heading 2",     syntax: "## Title",                  color: "var(--accent)" },
                { name: "Heading 3",     syntax: "### Title",                 color: "var(--accent)" },
                { name: "Link",          syntax: "[Label](url)",               color: "var(--accent-teal)" },
                { name: "Image",         syntax: "![Alt](url)",               color: "var(--accent-teal)" },
                { name: "Code Inline",   syntax: "`code`",                    color: "var(--accent-lav)" },
                { name: "Code Block",    syntax: "```js\ncode\n```",           color: "var(--accent-lav)" },
                { name: "Blockquote",    syntax: "> quote",                   color: "var(--accent-peach)" },
                { name: "Bullet List",   syntax: "- item",                    color: "var(--accent)" },
                { name: "Ordered List",  syntax: "1. item",                   color: "var(--accent)" },
                { name: "Task List",     syntax: "- [ ] task\n- [x] done",    color: "var(--accent-teal)" },
                { name: "Table",         syntax: "| A | B |\n|---|---|\n| 1 | 2 |", color: "var(--accent)" },
                { name: "Horiz. Rule",   syntax: "---",                       color: "var(--text-3)" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setMarkdown(md => md + "\n" + item.syntax)}
                  className="w-full text-left p-3 rounded-xl theme-transition transition-all duration-150 group
                    shadow-[var(--shadow-out-xs)] bg-[var(--bg-2)]
                    hover:shadow-[var(--shadow-out-sm)] hover:bg-[var(--bg-3)]
                    active:scale-[0.97] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]"
                >
                  <div className="text-[11px] font-display font-bold mb-1.5 transition-colors"
                    style={{ color: item.color }}>
                    {item.name}
                  </div>
                  <code className="text-[10.5px] font-mono whitespace-pre-line leading-relaxed block"
                    style={{ color: "var(--text-3)" }}>
                    {item.syntax}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATUS BAR ════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-5 py-1.5 flex items-center justify-between border-t border-[var(--border-subtle)] theme-transition"
        style={{ background: "var(--bg-2)" }}>
        <div className="flex items-center gap-5 text-[11px]" style={{ color: "var(--text-3)" }}>
          <span>Words: <strong style={{ color: "var(--text-2)" }}>{stats.words}</strong></span>
          <span>Chars: <strong style={{ color: "var(--text-2)" }}>{stats.chars}</strong></span>
          <span>~{stats.readMin} min read</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-3)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-teal)" }} />
            Live
          </span>
          <span>UTF-8</span>
          <span style={{ color: "var(--accent)" }}>{mode === "split" ? "Split" : "WYSIWYG"}</span>
        </div>
      </div>
    </main>
  );
}
