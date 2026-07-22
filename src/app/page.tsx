"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Button3D from "@/components/Button3D";
import ThemeToggle from "@/components/ThemeToggle";
import LiquidGlassToggle from "@/components/LiquidGlassToggle";
import { useTheme } from "@/hooks/useTheme";
import { renderMarkdown, DEFAULT_MARKDOWN } from "@/lib/markdownRenderer";
import type { WysiwygRef } from "@/components/WysiwygEditor";
import { exportToPng, exportToPdf, exportToHtml } from "@/lib/exportEngine";
import TableGenerator from "@/components/TableGenerator";
import ReadmeGenerator from "@/components/ReadmeGenerator";

// ── Dynamic imports (client-only) ─────────────────────────────────────────
const CodeMirrorEditor = dynamic(() => import("@/components/CodeMirrorEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
const WysiwygEditor = dynamic(() => import("@/components/WysiwygEditor"), {
  ssr: false,
  loading: () => <EditorSkeleton text="Loading WYSIWYG editor…" />,
});

// ── Skeleton loader ───────────────────────────────────────────────────────
function EditorSkeleton({ text = "Loading editor…" }: { text?: string }) {
  return (
    <div
      className="h-full flex items-center justify-center gap-2 text-sm font-mono"
      style={{ color: "var(--text-3)", background: "var(--ed-bg)" }}
    >
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {text}
    </div>
  );
}

// ── Pane label header ─────────────────────────────────────────────────────
function PaneLabel({ text, badge, children }: { text: string; badge?: string; children?: React.ReactNode }) {
  return (
    <div
      className="flex-shrink-0 px-4 py-2 flex items-center justify-between border-b border-[var(--border-subtle)]"
      style={{ background: "var(--ed-gutter-bg)" }}
    >
      {children ? children : (
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
          {text}
        </span>
      )}
      {badge && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: "var(--accent)", background: "rgba(37,99,235,0.12)" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Divider between toolbar items ─────────────────────────────────────────
function Divider() {
  return (
    <div
      className="w-px h-5 mx-1 flex-shrink-0"
      style={{ background: "var(--border-subtle)" }}
    />
  );
}

// ── Stats util ────────────────────────────────────────────────────────────
function getStats(md: string) {
  const words = md.trim() ? md.trim().split(/\s+/).length : 0;
  return { words, chars: md.length, readMin: Math.max(1, Math.round(words / 200)) };
}

// ── Cheatsheet Data ─────────────────────────────────────────────────────────
const CHEATSHEET = [
  { category: "Basic", name: "Heading 1",     syntax: "# Heading 1",                        color: "var(--accent)" },
  { category: "Basic", name: "Heading 2",     syntax: "## Heading 2",                       color: "var(--accent)" },
  { category: "Basic", name: "Heading 3",     syntax: "### Heading 3",                      color: "var(--accent)" },
  { category: "Basic", name: "Bold",          syntax: "**bold text**",                      color: "var(--accent)" },
  { category: "Basic", name: "Italic",        syntax: "*italic text*",                      color: "var(--accent-orange)" },
  { category: "Basic", name: "Blockquote",    syntax: "> Blockquote",                       color: "var(--accent-orange)" },
  { category: "Basic", name: "Bullet List",   syntax: "- Item 1\n- Item 2",                 color: "var(--accent)" },
  { category: "Basic", name: "Ordered List",  syntax: "1. First\n2. Second",                color: "var(--accent)" },
  { category: "Basic", name: "Horiz. Rule",   syntax: "---",                                color: "var(--text-3)" },
  { category: "Extended", name: "Strikethrough", syntax: "~~strikethrough~~",               color: "var(--text-3)" },
  { category: "Extended", name: "Task List",     syntax: "- [ ] Todo\n- [x] Done",          color: "var(--accent-teal)" },
  { category: "Extended", name: "Table",         syntax: "| Col 1 | Col 2 |\n|---|---|\n| A | B |", color: "var(--accent)" },
  { category: "Extended", name: "Link",          syntax: "[Link Label](https://...)",       color: "var(--accent-teal)" },
  { category: "Extended", name: "Image",         syntax: "![Image Alt](url)",               color: "var(--accent-teal)" },
  { category: "Code", name: "Inline Code",   syntax: "`console.log()`",                     color: "var(--accent-orange)" },
  { category: "Code", name: "Code Block",    syntax: "```js\nfunction test() {\n  return 1;\n}\n```", color: "var(--accent-orange)" },
  { category: "Advanced", name: "Mermaid Diagram", syntax: "```mermaid\ngraph TD;\n  A-->B;\n```", color: "var(--accent-teal)" },
  { category: "Advanced", name: "Mermaid Sequence", syntax: "```mermaid\nsequenceDiagram\n  Alice->>Bob: Hello\n```", color: "var(--accent-teal)" },
  { category: "Advanced", name: "Math Inline", syntax: "Einstein said $E=mc^2$", color: "var(--accent-orange)" },
  { category: "Advanced", name: "Math Block", syntax: "$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$", color: "var(--accent-orange)" },
  { category: "HTML", name: "Keyboard Key", syntax: "Press <kbd>Ctrl</kbd> + <kbd>C</kbd>", color: "var(--text-2)" },
  { category: "HTML", name: "Comment", syntax: "<!-- Hidden comment -->", color: "var(--text-3)" },
];

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function Home() {
  const { isDark }     = useTheme();
  const wysiwygRef     = useRef<WysiwygRef>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const isDragging     = useRef(false);

  const [markdown, setMarkdown]         = useState(DEFAULT_MARKDOWN);
  const [html, setHtml]                 = useState("");
  const [mode, setMode]                 = useState<"split" | "wysiwyg">("split");
  const [prevMode, setPrevMode]         = useState<"split" | "wysiwyg">("split");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showTableGen, setShowTableGen] = useState(false);
  const [showReadmeGen, setShowReadmeGen] = useState(false);
  const [leftWidth, setLeftWidth]       = useState(50);
  const [copied, setCopied]             = useState<"" | "md" | "html" | "text">("");
  const [wysiwygKey, setWysiwygKey]     = useState(0); // for forced remount on import
  const [cheatSearch, setCheatSearch]   = useState("");
  const [isMobile, setIsMobile]         = useState(false);
  const [mobileTab, setMobileTab]       = useState<"source" | "preview">("source");
  const [sourceViewMode, setSourceViewMode] = useState<"md" | "html" | "text">("md");
  const [cleanCopy, setCleanCopy]       = useState(true);

  const getTextContent = useCallback((htmlStr: string, clean: boolean) => {
    if (typeof document === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = htmlStr;
    
    if (clean) {
      temp.querySelectorAll(".katex-mathml").forEach(el => el.remove());
      temp.querySelectorAll(".mermaid, code.language-mermaid, svg").forEach(el => el.remove());
    }
    
    return temp.innerText || temp.textContent || "";
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const stats = getStats(markdown);

  const handleExport = async (format: "pdf" | "png" | "html") => {
    setExportMenuOpen(false);
    const previewEl = document.querySelector(".md-preview") as HTMLElement;
    if (!previewEl) return;
    
    try {
      if (format === "png") await exportToPng(previewEl, "glassmark.png");
      if (format === "pdf") await exportToPdf(previewEl, "glassmark.pdf");
      if (format === "html") exportToHtml(html, "glassmark.html");
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. See console for details.");
    }
  };

  // ── Mode switch handler ─────────────────────────────────────────────
  const handleModeChange = useCallback((m: "split" | "wysiwyg") => {
    setPrevMode(mode);
    setMode(m);
  }, [mode]);

  // ── Live preview (debounced) ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (sourceViewMode === "md") {
        renderMarkdown(markdown).then(setHtml);
      } else if (sourceViewMode === "html") {
        setHtml(markdown);
      } else if (sourceViewMode === "text") {
        const escaped = markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        setHtml(`<div style="white-space: pre-wrap; font-family: inherit; color: var(--text-1); line-height: 1.6;">${escaped}</div>`);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [markdown, sourceViewMode]);

  useEffect(() => { renderMarkdown(DEFAULT_MARKDOWN).then(setHtml); }, []);

  // ── Mermaid renderer ────────────────────────────────────────────────
  useEffect(() => {
    if (html && mode === "split") {
      const renderMermaid = async () => {
        try {
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default" });
          await mermaid.run({
            querySelector: '.md-preview code.language-mermaid',
            suppressErrors: true,
          });
        } catch (e) {
          // Ignore incomplete diagram errors while typing
        }
      };
      renderMermaid();
    }
  }, [html, mode, isDark]);

  // ── Toolbar: unified format helper ──────────────────────────────────
  // In split mode: inserts markdown syntax
  // In wysiwyg mode: calls Tiptap commands
  const cmWrap   = useCallback((b: string, a = b) => setMarkdown(m => m + `${b}text${a}`), []);
  const cmInsert = useCallback((s: string) => setMarkdown(m => m + "\n" + s), []);

  const cmd = useCallback((
    splitFn: () => void,
    wysiwygFn: () => void
  ) => {
    if (mode === "wysiwyg") wysiwygFn();
    else splitFn();
  }, [mode]);

  const handleInsert = (content: string) => {
    if (mode === "wysiwyg") {
      setMarkdown(md => md + "\n\n" + content);
      setWysiwygKey(k => k + 1); // Force remount to render new syntax correctly
    } else {
      setMarkdown(md => md + "\n\n" + content);
    }
  };

  // ── Toolbar action map ──────────────────────────────────────────────
  const fmt = {
    bold:    () => cmd(() => cmWrap("**"),                  () => wysiwygRef.current?.chain().toggleBold().run()),
    italic:  () => cmd(() => cmWrap("*"),                   () => wysiwygRef.current?.chain().toggleItalic().run()),
    strike:  () => cmd(() => cmWrap("~~"),                  () => wysiwygRef.current?.chain().toggleStrike().run()),
    code:    () => cmd(() => cmWrap("`"),                   () => wysiwygRef.current?.chain().toggleCode().run()),
    h1:      () => cmd(() => cmInsert("# "),               () => wysiwygRef.current?.chain().toggleHeading({ level: 1 }).run()),
    h2:      () => cmd(() => cmInsert("## "),              () => wysiwygRef.current?.chain().toggleHeading({ level: 2 }).run()),
    h3:      () => cmd(() => cmInsert("### "),             () => wysiwygRef.current?.chain().toggleHeading({ level: 3 }).run()),
    bullet:  () => cmd(() => cmInsert("- Item"),           () => wysiwygRef.current?.chain().toggleBulletList().run()),
    ordered: () => cmd(() => cmInsert("1. Item"),          () => wysiwygRef.current?.chain().toggleOrderedList().run()),
    task:    () => cmd(() => cmInsert("- [ ] Task"),       () => wysiwygRef.current?.chain().toggleTaskList().run()),
    quote:   () => cmd(() => cmInsert("> Quote"),          () => wysiwygRef.current?.chain().toggleBlockquote().run()),
    codeblock:() => cmd(() => cmInsert("```js\ncode\n```"),() => wysiwygRef.current?.chain().toggleCodeBlock().run()),
    hr:      () => cmd(() => cmInsert("---"),              () => wysiwygRef.current?.chain().setHorizontalRule().run()),
    link:    () => cmd(
      () => cmInsert("[Label](url)"),
      () => {
        const url = prompt("Enter URL:", "https://");
        if (url) wysiwygRef.current?.chain().setLink({ href: url }).run();
      }
    ),
    image:   () => cmInsert("![Alt](url)"),
    table:   () => setShowTableGen(true),
  };

  // ── Draggable divider ───────────────────────────────────────────────
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
      setLeftWidth(Math.min(80, Math.max(20, ((e.clientX - rect.left) / rect.width) * 100)));
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

  // ── File import ─────────────────────────────────────────────────────
  const importFile = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".md,.markdown,.txt";
    inp.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => {
        const content = ev.target?.result as string;
        setMarkdown(content);
        if (mode === "wysiwyg") setWysiwygKey(k => k + 1);
      };
      r.readAsText(f);
    };
    inp.click();
  };

  // ── Copy ─────────────────────────────────────────────────────────────
  const copy = async (type: "md" | "html" | "text") => {
    if (type === "md") {
      await navigator.clipboard.writeText(markdown);
    } else if (type === "html") {
      await navigator.clipboard.writeText(html);
    } else if (type === "text") {
      if (cleanCopy) {
        // Rich Formatted Text Copy for Word / Docs / Pages (Preserves headings, font size, bold, etc.)
        const temp = document.createElement("div");
        temp.innerHTML = html;
        // Clean math/svg artifacts
        temp.querySelectorAll(".katex-mathml").forEach(el => el.remove());
        temp.querySelectorAll(".mermaid, code.language-mermaid, svg").forEach(el => el.remove());

        const cleanHtml = temp.innerHTML;
        const plainText = temp.innerText || temp.textContent || "";

        try {
          const blobHtml = new Blob([cleanHtml], { type: "text/html" });
          const blobText = new Blob([plainText], { type: "text/plain" });
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/html": blobHtml,
              "text/plain": blobText,
            })
          ]);
        } catch (err) {
          console.warn("ClipboardItem write failed, falling back to writeText:", err);
          await navigator.clipboard.writeText(plainText);
        }
      } else {
        // Raw Plain Text (flat unformatted text)
        const plainText = getTextContent(html, false);
        await navigator.clipboard.writeText(plainText);
      }
    }
    setCopied(type);
    setTimeout(() => setCopied(""), 1800);
  };

  // ── Warn on unload ────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (markdown !== DEFAULT_MARKDOWN) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [markdown]);

  // ── Toolbar button ────────────────────────────────────────────────────
  const ToolBtn = ({
    label, title, onClick, wide = false,
  }: { label: string; title: string; onClick: () => void; wide?: boolean }) => (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={[
        "h-7 rounded-lg text-[11.5px] font-mono font-semibold select-none",
        "transition-all duration-100",
        "shadow-[var(--shadow-out-xs)] bg-[var(--bg-2)]",
        "hover:shadow-[var(--shadow-out-sm)] hover:bg-[var(--bg-3)]",
        "active:scale-[0.93] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]",
        wide ? "px-3" : "px-2.5",
      ].join(" ")}
      style={{ color: "var(--text-2)" }}
    >
      {label}
    </button>
  );

  // ── Panel slide animation class ───────────────────────────────────────
  const getSlideClass = () => {
    if (mode === "split" && prevMode === "wysiwyg") return "panel-in-left";
    if (mode === "wysiwyg" && prevMode === "split") return "panel-in-right";
    return "";
  };

  // ════════════════════════════════════════════════════════════════════
  return (
    <main
      className="h-screen flex flex-col overflow-hidden theme-transition"
      style={{ background: "var(--bg)" }}
    >
      {/* ════ NAVBAR ════════════════════════════════════════════════════ */}
      <header
        className="flex-shrink-0 z-50 px-5 py-2.5 flex items-center gap-4 border-b border-[var(--border)] theme-transition"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mr-2 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-white text-base select-none flex-shrink-0 transition-transform duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%)",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            M
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5 font-display font-extrabold text-[15px] tracking-tight leading-none" style={{ color: "var(--text-1)" }}>
              GlassMark
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-orange)] text-white uppercase tracking-wider">v1.0</span>
            </div>
            <div className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>
              Markdown Editor
            </div>
          </div>
        </div>

        {/* ── Liquid Glass Toggle (Phase 2 signature element) ── */}
        <LiquidGlassToggle mode={mode} setMode={handleModeChange} />

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowReadmeGen(true)}
            title="Open README Generator"
            className="h-9 px-4 text-xs font-semibold rounded-xl theme-transition transition-all duration-150
              shadow-[var(--shadow-out-sm)] bg-[var(--bg-2)]
              hover:shadow-[var(--shadow-out)] hover:bg-[var(--bg-3)]
              active:scale-[0.96] active:shadow-[var(--shadow-in-sm)] hidden sm:block"
            style={{ color: "var(--text-2)" }}
          >
            README Builder
          </button>

          <button
            onClick={importFile}
            title="Import .md file"
            className="h-9 px-4 text-xs font-semibold rounded-xl theme-transition transition-all duration-150
              shadow-[var(--shadow-out-sm)] bg-[var(--bg-2)]
              hover:shadow-[var(--shadow-out)] hover:bg-[var(--bg-3)]
              active:scale-[0.96] active:shadow-[var(--shadow-in-sm)]"
            style={{ color: "var(--text-2)" }}
          >
            Import
          </button>

          <button
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle cheatsheet sidebar"
            className="h-9 px-4 text-xs font-semibold rounded-xl theme-transition transition-all duration-150
              active:scale-[0.96]"
            style={
              sidebarOpen
                ? { background: "var(--accent)", color: "#fff", boxShadow: "var(--shadow-accent)" }
                : {
                    background: "var(--bg-2)",
                    color: "var(--text-2)",
                    boxShadow: "var(--shadow-out-sm)",
                  }
            }
          >
            Cheatsheet
          </button>

          <ThemeToggle />

          <div className="relative">
            <div onClick={() => setExportMenuOpen(o => !o)}>
              <Button3D variant="accent" size="sm">Export ↓</Button3D>
            </div>
            
            {exportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setExportMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 top-full mt-2 w-40 rounded-xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2"
                  style={{ 
                    background: "var(--glass-bg)", 
                    backdropFilter: "blur(20px)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-out)"
                  }}
                >
                  <button 
                    onClick={() => handleExport("pdf")}
                    className="w-full text-left px-4 py-2 text-sm transition-colors font-medium"
                    style={{ color: "var(--text-1)", background: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    Export as PDF
                  </button>
                  <button 
                    onClick={() => handleExport("png")}
                    className="w-full text-left px-4 py-2 text-sm transition-colors font-medium"
                    style={{ color: "var(--text-1)", background: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    Export as PNG
                  </button>
                  <button 
                    onClick={() => handleExport("html")}
                    className="w-full text-left px-4 py-2 text-sm transition-colors font-medium"
                    style={{ color: "var(--text-1)", background: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-3)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    Export as HTML
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ════ TOOLBAR ════════════════════════════════════════════════════ */}
      <div
        className="flex-shrink-0 px-4 py-2 flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] theme-transition"
        style={{ background: "var(--bg-2)" }}
      >
        <ToolBtn label="B"  title="Bold (Ctrl+B)"       onClick={fmt.bold} />
        <ToolBtn label="I"  title="Italic (Ctrl+I)"     onClick={fmt.italic} />
        <ToolBtn label="~~" title="Strikethrough"        onClick={fmt.strike} />
        <ToolBtn label="`"  title="Inline code"         onClick={fmt.code} />
        <Divider />
        <ToolBtn label="H1" title="Heading 1"           onClick={fmt.h1} />
        <ToolBtn label="H2" title="Heading 2"           onClick={fmt.h2} />
        <ToolBtn label="H3" title="Heading 3"           onClick={fmt.h3} />
        <Divider />
        <ToolBtn label="• List"  title="Bullet list"    onClick={fmt.bullet}  wide />
        <ToolBtn label="1. List" title="Ordered list"   onClick={fmt.ordered} wide />
        <ToolBtn label="☑ Task"  title="Task list"      onClick={fmt.task}    wide />
        <ToolBtn label="❝"       title="Blockquote"     onClick={fmt.quote} />
        <Divider />
        <ToolBtn label="Link"    title="Insert link"    onClick={fmt.link}     wide />
        <ToolBtn label="Img"     title="Insert image"   onClick={fmt.image}    wide />
        <ToolBtn label="Table"   title="Insert table"   onClick={fmt.table}    wide />
        <ToolBtn label="---"     title="Horizontal rule" onClick={fmt.hr} />
        <ToolBtn label="```"     title="Code block"     onClick={fmt.codeblock} />

        <div className="flex-1" />

        <button
          onClick={() => copy("md")}
          className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95"
          style={{ color: copied === "md" ? "var(--accent-teal)" : "var(--text-3)" }}
        >
          {copied === "md" ? "✓ Copied" : "Copy MD"}
        </button>
        <button
          onClick={() => copy("html")}
          className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95"
          style={{ color: copied === "html" ? "var(--accent-teal)" : "var(--text-3)" }}
        >
          {copied === "html" ? "✓ Copied" : "Copy HTML"}
        </button>
        <div className="flex items-center gap-1 border-l border-[var(--border-subtle)] pl-2 ml-1">
          <button
            onClick={() => setCleanCopy(c => !c)}
            title={cleanCopy ? "Formatted Copy ON: preserves headings, font sizes & weights in Word/Docs" : "Raw Text ON: flat unformatted plain text"}
            className="h-7 px-2 rounded-lg text-[10px] font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1"
            style={{ 
              color: cleanCopy ? "var(--accent-teal)" : "var(--text-3)",
              background: cleanCopy ? "rgba(45,212,191,0.12)" : "transparent"
            }}
          >
            {cleanCopy ? "✓ Formatted Text" : "Raw Text"}
          </button>
          <button
            onClick={() => copy("text")}
            className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all duration-150 active:scale-95"
            style={{ color: copied === "text" ? "var(--accent-teal)" : "var(--text-3)" }}
          >
            {copied === "text" ? "✓ Copied" : "Copy Text"}
          </button>
        </div>
      </div>

      {/* ════ WORKSPACE ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Main editor area ─────────────────────────────────────── */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden">

          {mode === "split" ? (
            isMobile ? (
              /* ── Split View Mobile (Tabs) ───────────────────────────── */
              <div className={`flex-1 flex flex-col overflow-hidden ${getSlideClass()}`}>
                <div className="flex border-b border-[var(--border-subtle)]" style={{ background: "var(--ed-gutter-bg)" }}>
                  <div className="flex-1 flex flex-col justify-center" style={{ borderBottom: mobileTab === "source" ? "2px solid var(--accent)" : "2px solid transparent" }}>
                    <select 
                      value={sourceViewMode}
                      onChange={(e) => {
                        setSourceViewMode(e.target.value as any);
                        setMobileTab("source");
                      }}
                      onClick={() => setMobileTab("source")}
                      className="w-full py-3 text-center text-xs font-bold bg-transparent outline-none cursor-pointer appearance-none"
                      style={{ color: mobileTab === "source" ? "var(--accent)" : "var(--text-3)" }}
                    >
                      <option value="md">Markdown Source</option>
                      <option value="html">HTML Source</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </div>
                  <button 
                    className="flex-1 py-3 text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    style={{ 
                      color: mobileTab === "preview" ? "var(--accent)" : "var(--text-3)",
                      borderBottom: mobileTab === "preview" ? "2px solid var(--accent)" : "2px solid transparent"
                    }}
                    onClick={() => setMobileTab("preview")}
                  >
                    Live Preview
                  </button>
                </div>
                {mobileTab === "source" ? (
                  <div className="flex-1 overflow-hidden">
                    <CodeMirrorEditor 
                      value={markdown} 
                      onChange={setMarkdown} 
                      isDark={isDark} 
                      language={sourceViewMode}
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto px-2 py-4 bg-[var(--bg-2)]">
                    <div className="md-preview mx-auto bg-[var(--bg)] shadow-[var(--shadow-out)] rounded-xl p-4 sm:p-8 min-h-full border border-[var(--border-subtle)]" dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                )}
              </div>
            ) : (
              /* ── Split View Desktop ─────────────────────────────────────────── */
              <div className={`flex-1 flex overflow-hidden ${getSlideClass()}`}>
                {/* Left: CodeMirror source */}
                <div
                  className="flex flex-col overflow-hidden border-r border-[var(--border-subtle)]"
                  style={{ width: `${leftWidth}%` }}
                >
                  <PaneLabel text="" badge="Editor">
                    <select 
                      value={sourceViewMode}
                      onChange={(e) => setSourceViewMode(e.target.value as "md" | "html" | "text")}
                      className="text-[10px] font-bold tracking-widest uppercase bg-transparent border-none outline-none cursor-pointer"
                      style={{ color: "var(--text-3)" }}
                    >
                      <option value="md">Markdown Source</option>
                      <option value="html">HTML Output</option>
                      <option value="text">Plain Text</option>
                    </select>
                  </PaneLabel>
                  <div className="flex-1 overflow-hidden">
                    <CodeMirrorEditor
                      value={markdown}
                      onChange={setMarkdown}
                      isDark={isDark}
                      language={sourceViewMode}
                    />
                  </div>
                </div>

                {/* Draggable divider */}
                <div className="resize-divider" onMouseDown={onDividerDown} />

                {/* Right: Live preview */}
                <div
                  className="flex flex-col overflow-hidden"
                  style={{ width: `${100 - leftWidth}%`, background: "var(--bg-2)" }}
                >
                  <PaneLabel text="Live Preview" badge="GFM ✓" />
                  <div className="flex-1 overflow-auto px-4 py-8 sm:px-8 bg-[var(--bg-2)]">
                    <div
                      className="md-preview max-w-3xl mx-auto bg-[var(--bg)] shadow-[var(--shadow-out)] rounded-xl p-8 sm:p-12 min-h-[100%] border border-[var(--border-subtle)]"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            /* ── WYSIWYG Mode ───────────────────────────────────────── */
            <div className={`flex-1 flex flex-col overflow-hidden ${getSlideClass()}`}>
              <PaneLabel text="WYSIWYG Editor" badge="Rich Text ✓" />

              {/* WYSIWYG editor (Tiptap) */}
              <WysiwygEditor
                key={wysiwygKey}
                ref={wysiwygRef}
                initialMarkdown={markdown}
                onChange={setMarkdown}
                isDark={isDark}
              />
            </div>
          )}
        </div>

        {/* ── Sidebar / Cheatsheet ─────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out border-l border-[var(--border-subtle)] theme-transition"
          style={{
            width: sidebarOpen ? "272px" : "0px",
            background: "var(--bg-2)",
          }}
        >
          <div className="w-[272px] flex flex-col h-full overflow-hidden">
            <div
              className="flex-shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm" style={{ color: "var(--text-1)" }}>
                  Cheatsheet
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[var(--bg-3)] transition-colors text-base leading-none"
                  style={{ color: "var(--text-3)" }}
                >
                  ×
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Search syntax..." 
                value={cheatSearch}
                onChange={e => setCheatSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs border focus:outline-none transition-colors"
                style={{ 
                  background: "var(--bg)", 
                  color: "var(--text-1)", 
                  borderColor: "var(--border-subtle)" 
                }}
              />
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {CHEATSHEET.filter(item => 
                item.name.toLowerCase().includes(cheatSearch.toLowerCase()) || 
                item.syntax.toLowerCase().includes(cheatSearch.toLowerCase()) ||
                item.category.toLowerCase().includes(cheatSearch.toLowerCase())
              ).map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (mode === "wysiwyg") {
                      // In WYSIWYG, insert as raw text that gets parsed
                      setMarkdown(md => md + "\n\n" + item.syntax);
                      setWysiwygKey(k => k + 1);
                    } else {
                      setMarkdown(md => md + "\n\n" + item.syntax);
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl theme-transition transition-all duration-150
                    shadow-[var(--shadow-out-xs)] bg-[var(--bg-2)]
                    hover:shadow-[var(--shadow-out-sm)] hover:bg-[var(--bg-3)]
                    active:scale-[0.97] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]"
                >
                  <div className="text-[11px] font-display font-bold mb-1.5" style={{ color: item.color }}>
                    {item.name}
                  </div>
                  <code className="text-[10.5px] font-mono whitespace-pre-line leading-relaxed block" style={{ color: "var(--text-3)" }}>
                    {item.syntax}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════ STATUS BAR ══════════════════════════════════════════════════ */}
      <footer
        className="flex-shrink-0 px-5 py-1.5 flex items-center justify-between border-t border-[var(--border-subtle)] theme-transition"
        style={{ background: "var(--bg-2)" }}
      >
        <div className="flex items-center gap-5 text-[11px]" style={{ color: "var(--text-3)" }}>
          <span>Words: <strong style={{ color: "var(--text-2)" }}>{stats.words}</strong></span>
          <span>Chars: <strong style={{ color: "var(--text-2)" }}>{stats.chars}</strong></span>
          <span>~{stats.readMin} min read</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-3)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent-orange)", boxShadow: "0 0 8px var(--accent-orange)" }} />
            Live
          </span>
          <span>UTF-8</span>
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            {mode === "split" ? "⊞ Split View" : "✏ WYSIWYG"}
          </span>
        </div>
      </footer>

      {showTableGen && (
        <TableGenerator onInsert={handleInsert} onClose={() => setShowTableGen(false)} />
      )}
      
      {showReadmeGen && (
        <ReadmeGenerator onInsert={handleInsert} onClose={() => setShowReadmeGen(false)} />
      )}
    </main>
  );
}
