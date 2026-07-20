"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, drawSelection } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { HighlightStyle, syntaxHighlighting, bracketMatching } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// Custom blue-themed syntax highlight
const blueThemeHighlight = HighlightStyle.define([
  { tag: tags.heading1, color: "#1a1f36", fontWeight: "800", fontSize: "1.1em" },
  { tag: tags.heading2, color: "#1a1f36", fontWeight: "700" },
  { tag: tags.heading3, color: "#1a1f36", fontWeight: "600" },
  { tag: tags.strong, color: "#1a1f36", fontWeight: "700" },
  { tag: tags.emphasis, color: "#3d4771", fontStyle: "italic" },
  { tag: tags.link, color: "#3b6ef8", textDecoration: "underline" },
  { tag: tags.url, color: "#6090fb" },
  { tag: tags.strikethrough, color: "#8892b0", textDecoration: "line-through" },
  { tag: tags.monospace, color: "#2952ed", background: "#e4edff", borderRadius: "3px", padding: "0 3px" },
  { tag: tags.processingInstruction, color: "#8892b0" },
  { tag: tags.comment, color: "#8892b0", fontStyle: "italic" },
  { tag: tags.keyword, color: "#3b6ef8", fontWeight: "600" },
  { tag: tags.string, color: "#1d7a4e" },
  { tag: tags.number, color: "#b95000" },
  { tag: tags.operator, color: "#3d4771" },
  { tag: tags.punctuation, color: "#8892b0" },
  { tag: tags.meta, color: "#8892b0" },
]);

// Extension theme (overrides base CM theme)
const editorTheme = EditorView.theme({
  "&": {
    fontSize: "13.5px",
    fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, Fira Mono, monospace",
    height: "100%",
    backgroundColor: "transparent",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "1.75",
  },
  ".cm-content": {
    caretColor: "#3b6ef8",
    padding: "16px 16px 48px",
    minHeight: "100%",
  },
  ".cm-cursor": { borderLeftColor: "#3b6ef8", borderLeftWidth: "2px" },
  ".cm-selectionBackground": { background: "#bfd3ff !important" },
  ".cm-line": { color: "#1a1f36" },
  ".cm-gutters": {
    background: "#f0f4ff",
    borderRight: "1px solid #dbe8ff",
    color: "#93b4fd",
    paddingRight: "8px",
    userSelect: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    fontSize: "11px",
    minWidth: "32px",
    textAlign: "right",
  },
  ".cm-activeLineGutter": { background: "#dbe8ff" },
  ".cm-activeLine": { background: "#edf2ff" },
  "&.cm-focused": { outline: "none" },
}, { dark: false });

interface CodeMirrorEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function CodeMirrorEditor({ value, onChange, className = "" }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        drawSelection(),
        history(),
        bracketMatching(),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
        syntaxHighlighting(blueThemeHighlight),
        editorTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // only runs on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. file import) without resetting cursor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full overflow-auto ${className}`}
    />
  );
}
