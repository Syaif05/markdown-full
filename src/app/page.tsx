"use client";

import React, { useState } from "react";
import GlassPanel from "@/components/GlassPanel";
import Button3D from "@/components/Button3D";

export default function Home() {
  const [editorMode, setEditorMode] = useState<"split" | "wysiwyg">("split");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sampleMarkdown = `# Selamat Datang di GlassMark ⚡

GlassMark adalah All-in-One Markdown Tool dengan desain **Skeuomorphic + Liquid Glass** yang elegan.

## Fitur Utama:
- [x] Live Preview Real-time
- [x] Dual Mode: Split-view & WYSIWYG
- [ ] Diagram Mermaid & Math LaTeX
- [ ] Export PDF, HTML & PNG
- [ ] Table & README Generator

\`\`\`javascript
// Contoh Code Block
const glassmark = {
  aesthetics: "Liquid Glass",
  tactility: "Skeuomorphic 3D",
  speed: "Fast Client-side"
};
\`\`\``;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#F8F9FD] p-4 md:p-6 flex flex-col justify-between selection:bg-brand-accent/20">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-accent/8 blur-[120px] animate-orb-1 pointer-events-none -z-10" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-success/6 blur-[130px] animate-orb-2 pointer-events-none -z-10" />
      <div className="absolute top-[35%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[110px] animate-orb-3 pointer-events-none -z-10" />

      {/* Floating Glass Navbar */}
      <GlassPanel className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-50 mb-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-[#728fff] flex items-center justify-center shadow-md shadow-brand-accent/20">
            <span className="font-display font-black text-white text-lg tracking-wider">
              G
            </span>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl tracking-tight text-brand-ink flex items-center gap-1.5">
              GlassMark
              <span className="text-[10px] font-semibold bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full border border-brand-accent/25">
                Fase 0
              </span>
            </h1>
            <p className="text-[10px] text-brand-ink-light">
              All-in-One Markdown Tool
            </p>
          </div>
        </div>

        {/* Mode Toggle Switch (Liquid Glass Mock) */}
        <div className="relative flex p-1 bg-brand-surface rounded-xl border border-brand-ink/5 shadow-inner w-56">
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm border border-brand-ink/5 transition-all duration-300 ease-out"
            style={{
              left: editorMode === "split" ? "4px" : "112px",
              width: "108px",
            }}
          />
          <button
            onClick={() => setEditorMode("split")}
            className={`flex-1 relative z-10 py-1.5 text-xs font-display font-bold text-center transition-colors duration-200 ${
              editorMode === "split"
                ? "text-brand-accent"
                : "text-brand-ink-light hover:text-brand-ink"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setEditorMode("wysiwyg")}
            className={`flex-1 relative z-10 py-1.5 text-xs font-display font-bold text-center transition-colors duration-200 ${
              editorMode === "wysiwyg"
                ? "text-brand-accent"
                : "text-brand-ink-light hover:text-brand-ink"
            }`}
          >
            WYSIWYG
          </button>
        </div>

        {/* Action Buttons & Accent Picker */}
        <div className="flex items-center gap-3">
          {/* Mock Accent Picker */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-surface/80 rounded-xl border border-brand-ink/5 mr-2">
            <span className="text-[10px] font-semibold text-brand-ink-light mr-1">
              Theme
            </span>
            <button className="w-3.5 h-3.5 rounded-full bg-brand-accent border-2 border-white ring-2 ring-brand-accent/30" />
            <button className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white hover:ring-2 hover:ring-[#10B981]/30 transition-all" />
            <button className="w-3.5 h-3.5 rounded-full bg-[#EC4899] border border-white hover:ring-2 hover:ring-[#EC4899]/30 transition-all" />
          </div>

          <Button3D
            variant="glass"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button3D>

          <Button3D variant="primary" size="sm">
            Export
          </Button3D>
        </div>
      </GlassPanel>

      {/* Main Workspace Panel */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex gap-6 relative z-10 h-[calc(100vh-170px)] min-h-[500px]">
        {/* Editor Containers */}
        <GlassPanel className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Editor Toolbar */}
          <div className="px-4 py-2 border-b border-brand-ink/5 bg-white/20 flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className="w-8 h-8 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors font-bold text-xs flex items-center justify-center"
                title="Bold"
              >
                B
              </button>
              <button
                className="w-8 h-8 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors italic font-serif text-xs flex items-center justify-center"
                title="Italic"
              >
                I
              </button>
              <button
                className="w-8 h-8 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors font-mono text-xs flex items-center justify-center"
                title="Header"
              >
                H
              </button>
              <div className="w-[1px] h-4 bg-brand-ink/10 mx-1" />
              <button
                className="px-2 py-1 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors text-xs flex items-center justify-center"
                title="List"
              >
                • List
              </button>
              <button
                className="px-2 py-1 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors text-xs flex items-center justify-center"
                title="Link"
              >
                Link
              </button>
              <button
                className="px-2 py-1 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors text-xs flex items-center justify-center"
                title="Image"
              >
                Img
              </button>
              <button
                className="px-2 py-1 rounded-lg hover:bg-brand-ink/5 text-brand-ink-light hover:text-brand-ink transition-colors text-xs flex items-center justify-center"
                title="Table"
              >
                Table
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-brand-ink-light bg-brand-surface px-2.5 py-1 rounded-md border border-brand-ink/5 font-semibold">
                Auto-Save (Local)
              </span>
            </div>
          </div>

          {/* Editors Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Split Mode */}
            {editorMode === "split" ? (
              <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brand-ink/5 h-full">
                {/* Left Pane - Source Pane Mock */}
                <div className="flex-1 flex flex-col h-full min-w-[200px] overflow-hidden">
                  <div className="px-4 py-1.5 bg-brand-surface/40 text-[10px] font-bold text-brand-ink-light border-b border-brand-ink/5 tracking-wider">
                    SOURCE EDITOR (MARKDOWN)
                  </div>
                  <div className="flex-1 p-4 font-mono text-sm overflow-auto bg-white/10 select-text whitespace-pre-wrap leading-relaxed text-brand-ink-light focus:outline-none">
                    <div className="flex gap-4 min-h-full">
                      <div className="text-right text-brand-ink-light/25 select-none border-r border-brand-ink/5 pr-3 text-xs leading-relaxed hidden sm:block">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <div className="flex-1 outline-none text-brand-ink select-text whitespace-pre-wrap leading-relaxed">
                        {sampleMarkdown}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draggable Divider (Mock) */}
                <div className="hidden md:flex flex-col items-center justify-center w-3 hover:bg-brand-accent/5 cursor-col-resize transition-all z-20 group">
                  <div className="w-1.5 h-12 rounded-full bg-brand-ink/15 group-hover:bg-brand-accent transition-colors shadow-sm" />
                </div>

                {/* Right Pane - Preview Pane Mock */}
                <div className="flex-1 flex flex-col h-full min-w-[200px] overflow-hidden">
                  <div className="px-4 py-1.5 bg-brand-surface/40 text-[10px] font-bold text-brand-ink-light border-b border-brand-ink/5 tracking-wider">
                    LIVE PREVIEW (HTML)
                  </div>
                  <div className="flex-1 p-6 overflow-auto bg-white/5 select-text">
                    <h1 className="font-display font-extrabold text-2xl text-brand-ink mb-3 tracking-tight border-b border-brand-ink/5 pb-2">
                      Selamat Datang di GlassMark ⚡
                    </h1>
                    <p className="text-brand-ink-light text-sm leading-relaxed mb-4">
                      GlassMark adalah All-in-One Markdown Tool dengan desain{" "}
                      <strong className="text-brand-ink font-semibold">
                        Skeuomorphic + Liquid Glass
                      </strong>{" "}
                      yang elegan.
                    </p>
                    <h2 className="font-display font-bold text-lg text-brand-ink mt-6 mb-3 tracking-tight">
                      Fitur Utama:
                    </h2>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink-light">
                        <span className="w-4 h-4 rounded bg-brand-success/20 border border-brand-success text-brand-success flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        Live Preview Real-time
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink-light">
                        <span className="w-4 h-4 rounded bg-brand-success/20 border border-brand-success text-brand-success flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        Dual Mode: Split-view & WYSIWYG
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink-light">
                        <span className="w-4 h-4 rounded bg-brand-ink/5 border border-brand-ink/15 text-transparent flex items-center justify-center text-[10px] font-bold">
                          -
                        </span>
                        Diagram Mermaid & Math LaTeX
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink-light">
                        <span className="w-4 h-4 rounded bg-brand-ink/5 border border-brand-ink/15 text-transparent flex items-center justify-center text-[10px] font-bold">
                          -
                        </span>
                        Export PDF, HTML & PNG
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink-light">
                        <span className="w-4 h-4 rounded bg-brand-ink/5 border border-brand-ink/15 text-transparent flex items-center justify-center text-[10px] font-bold">
                          -
                        </span>
                        Table & README Generator
                      </li>
                    </ul>
                    <div className="bg-brand-surface/80 rounded-xl p-4 border border-brand-ink/5 font-mono text-xs leading-relaxed text-brand-ink-light mb-4 shadow-sm">
                      <div className="text-[10px] font-bold text-brand-accent/60 mb-1">
                        JAVASCRIPT
                      </div>
                      <span className="text-purple-600">const</span> glassmark ={" "}
                      {"{"} <br />
                      &nbsp;&nbsp;aesthetics:{" "}
                      <span className="text-green-600">{"\"Liquid Glass\""}</span>,{" "}
                      <br />
                      &nbsp;&nbsp;tactility:{" "}
                      <span className="text-green-600">{"\"Skeuomorphic 3D\""}</span>
                      , <br />
                      &nbsp;&nbsp;speed:{" "}
                      <span className="text-green-600">{"\"Fast Client-side\""}</span>{" "}
                      <br />
                      {"};"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* WYSIWYG Mode Mock */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="px-4 py-1.5 bg-brand-surface/40 text-[10px] font-bold text-brand-ink-light border-b border-brand-ink/5 tracking-wider">
                  WYSIWYG EDITOR (RICH TEXT DIRECT-EDIT)
                </div>
                <div className="flex-1 p-8 overflow-auto bg-white/10 select-text max-w-4xl mx-auto w-full leading-relaxed">
                  <div className="outline-none min-h-full" contentEditable>
                    <h1 className="font-display font-extrabold text-3xl text-brand-ink mb-4 tracking-tight border-b border-brand-ink/10 pb-2">
                      Selamat Datang di GlassMark ⚡
                    </h1>
                    <p className="text-brand-ink text-base leading-relaxed mb-4">
                      GlassMark adalah All-in-One Markdown Tool dengan desain{" "}
                      <strong>Skeuomorphic + Liquid Glass</strong> yang elegan.
                    </p>
                    <h2 className="font-display font-bold text-xl text-brand-ink mt-8 mb-4 tracking-tight">
                      Fitur Utama:
                    </h2>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink">
                        <span className="w-4 h-4 rounded bg-brand-success/20 border border-brand-success text-brand-success flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        Live Preview Real-time
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink">
                        <span className="w-4 h-4 rounded bg-brand-success/20 border border-brand-success text-brand-success flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        Dual Mode: Split-view & WYSIWYG
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-brand-ink">
                        <span className="w-4 h-4 rounded bg-brand-ink/5 border border-brand-ink/15 text-transparent flex items-center justify-center text-[10px] font-bold">
                          -
                        </span>
                        Diagram Mermaid & Math LaTeX
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-2 border-t border-brand-ink/5 bg-brand-surface/40 flex flex-wrap items-center justify-between text-[11px] text-brand-ink-light gap-2">
            <div className="flex items-center gap-4">
              <span>
                Words: <strong>42</strong>
              </span>
              <span>
                Characters: <strong>318</strong>
              </span>
              <span>
                Reading Time: <strong>~1 min</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                Live Sync
              </span>
              <span>UTF-8</span>
            </div>
          </div>
        </GlassPanel>

        {/* Sidebar Kanan (Collapsible) */}
        <div
          className={`h-full transition-all duration-300 ease-in-out overflow-hidden flex ${
            sidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <GlassPanel className="w-80 flex flex-col h-full p-4 border-l border-brand-ink/5">
            <h3 className="font-display font-bold text-sm text-brand-ink mb-4 pb-2 border-b border-brand-ink/5">
              Markdown Cheatsheet
            </h3>
            <div className="flex-1 overflow-auto space-y-4 pr-1 text-xs">
              <div className="space-y-2 bg-brand-surface/50 p-3 rounded-xl border border-brand-ink/5">
                <div className="font-semibold text-brand-ink flex justify-between">
                  <span>Bold / Italic</span>
                  <span className="text-[10px] text-brand-accent font-bold">
                    Insert
                  </span>
                </div>
                <code className="block bg-white p-1.5 rounded border border-brand-ink/5 text-brand-ink-light">
                  **teks tebal** <br />
                  *teks miring*
                </code>
              </div>
              <div className="space-y-2 bg-brand-surface/50 p-3 rounded-xl border border-brand-ink/5">
                <div className="font-semibold text-brand-ink flex justify-between">
                  <span>Headers</span>
                  <span className="text-[10px] text-brand-accent font-bold">
                    Insert
                  </span>
                </div>
                <code className="block bg-white p-1.5 rounded border border-brand-ink/5 text-brand-ink-light">
                  # Header 1 <br />
                  ## Header 2 <br />
                  ### Header 3
                </code>
              </div>
              <div className="space-y-2 bg-brand-surface/50 p-3 rounded-xl border border-brand-ink/5">
                <div className="font-semibold text-brand-ink flex justify-between">
                  <span>Links & Images</span>
                  <span className="text-[10px] text-brand-accent font-bold">
                    Insert
                  </span>
                </div>
                <code className="block bg-white p-1.5 rounded border border-brand-ink/5 text-brand-ink-light whitespace-normal">
                  [Judul Link](url) <br />
                  ![Alt Teks](url_gambar)
                </code>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-ink/5">
              <Button3D variant="secondary" className="w-full text-center" size="sm">
                Table Generator
              </Button3D>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Footer / Info */}
      <footer className="text-center text-[10px] text-brand-ink-light mt-6 pb-2 relative z-10">
        &copy; {new Date().getFullYear()} GlassMark — Dibangun dengan AntiGravity
        dan Next.js.
      </footer>
    </main>
  );
}
