"use client";

import { useEffect, useRef } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import {
  HighlightStyle,
  bracketMatching,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { html as htmlLang } from "@codemirror/lang-html";

// ── Syntax highlight — Light (Electric Blue & Orange palette) ─────────────
const lightHL = HighlightStyle.define([
  { tag: tags.heading1,   color: "#1E40AF", fontWeight: "800", fontSize: "1.05em" },
  { tag: tags.heading2,   color: "#2563EB", fontWeight: "700" },
  { tag: tags.heading3,   color: "#3B82F6", fontWeight: "700" },
  { tag: tags.heading4,   color: "#2563EB", fontWeight: "600" },
  { tag: tags.strong,     color: "#1E293B", fontWeight: "700" },
  { tag: tags.emphasis,   color: "#F97316", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#9498B8", textDecoration: "line-through" },
  { tag: tags.link,       color: "#0284C7", textDecoration: "underline" },
  { tag: tags.url,        color: "#0284C7", fontStyle: "italic" },
  { tag: tags.monospace,  color: "#EA580C", background: "rgba(249,115,22,0.10)", borderRadius: "3px", padding: "0 3px" },
  { tag: tags.processingInstruction, color: "#9498B8" },
  { tag: tags.meta,       color: "#2563EB" },
  { tag: tags.comment,    color: "#9498B8", fontStyle: "italic" },
  { tag: tags.keyword,    color: "#2563EB", fontWeight: "600" },
  { tag: tags.string,     color: "#EA580C" },
  { tag: tags.number,     color: "#0D9488" },
  { tag: tags.bool,       color: "#2563EB", fontWeight: "600" },
  { tag: tags.operator,   color: "#475569" },
  { tag: tags.punctuation, color: "#9498B8" },
  { tag: tags.bracket,    color: "#2563EB" },
  { tag: tags.typeName,   color: "#0284C7" },
  { tag: tags.function(tags.variableName), color: "#2563EB" },
  { tag: tags.definition(tags.variableName), color: "#1E40AF" },
]);

// ── Syntax highlight — Dark (VSCode Blue & Amber palette) ──────────────────
const darkHL = HighlightStyle.define([
  { tag: tags.heading1,   color: "#93C5FD", fontWeight: "800", fontSize: "1.05em" },
  { tag: tags.heading2,   color: "#60A5FA", fontWeight: "700" },
  { tag: tags.heading3,   color: "#3B82F6", fontWeight: "700" },
  { tag: tags.heading4,   color: "#3B82F6", fontWeight: "600" },
  { tag: tags.strong,     color: "#F1F5F9", fontWeight: "700" },
  { tag: tags.emphasis,   color: "#FB923C", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#52567A", textDecoration: "line-through" },
  { tag: tags.link,       color: "#38BDF8", textDecoration: "underline" },
  { tag: tags.url,        color: "#38BDF8", fontStyle: "italic" },
  { tag: tags.monospace,  color: "#FB923C", background: "rgba(251,146,60,0.12)", borderRadius: "3px", padding: "0 3px" },
  { tag: tags.processingInstruction, color: "#52567A" },
  { tag: tags.meta,       color: "#60A5FA" },
  { tag: tags.comment,    color: "#64748B", fontStyle: "italic" },
  { tag: tags.keyword,    color: "#60A5FA", fontWeight: "600" },
  { tag: tags.string,     color: "#FDBA74" },
  { tag: tags.number,     color: "#2DD4BF" },
  { tag: tags.bool,       color: "#60A5FA", fontWeight: "600" },
  { tag: tags.operator,   color: "#CBD5E1" },
  { tag: tags.punctuation, color: "#94A3B8" },
  { tag: tags.bracket,    color: "#60A5FA" },
  { tag: tags.typeName,   color: "#38BDF8" },
  { tag: tags.function(tags.variableName), color: "#FDE047" },
  { tag: tags.definition(tags.variableName), color: "#93C5FD" },
]);

// ── Custom CodeMirror theme creator ──────────────────────────────────────
function buildEditorTheme(dark: boolean) {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: "13.5px",
        backgroundColor: "var(--ed-bg)",
        color: "var(--text-1)",
      },
      ".cm-content": {
        caretColor: "var(--ed-cursor)",
        fontFamily: "var(--font-mono)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--ed-gutter-bg)",
        color: "var(--ed-gutter-fg)",
        borderRight: "1px solid var(--border-subtle)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        minWidth: "38px",
        paddingRight: "8px",
        textAlign: "right",
        letterSpacing: "0.02em",
        fontFamily: "var(--font-mono)",
      },
      ".cm-gutterElement.cm-activeLineGutter": {
        background: "var(--ed-gutter-bg)",
        color: "var(--ed-gutter-active-fg)",
        fontWeight: "600",
      },
      ".cm-activeLine": { background: "var(--ed-line-active)" },
      "&.cm-focused": { outline: "none !important" },
      ".cm-matchingBracket": {
        background: "rgba(37,99,235,0.18)",
        outline: "1px solid rgba(37,99,235,0.45)",
        borderRadius: "3px",
      },
    },
    { dark }
  );
}

// ── Compartments (module-level — one instance for the whole app) ─────────
const themeComp = new Compartment();
const hlComp    = new Compartment();
const readOnlyComp = new Compartment();
const langComp = new Compartment();

interface Props {
  value: string;
  onChange: (val: string) => void;
  isDark: boolean;
  className?: string;
  readOnly?: boolean;
  language?: "md" | "html" | "text";
}

export default function CodeMirrorEditor({
  value,
  onChange,
  isDark,
  className = "",
  readOnly = false,
  language = "md",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef      = useRef<EditorView | null>(null);
  const onChangeRef  = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Create editor on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        // Theme compartments (swappable)
        themeComp.of(buildEditorTheme(isDark)),
        hlComp.of(syntaxHighlighting(isDark ? darkHL : lightHL)),
        // Core
        history(),
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        bracketMatching(),
        EditorView.lineWrapping,
        // Language
        langComp.of(
          language === "html" ? htmlLang() : 
          language === "md" ? markdown({ base: markdownLanguage, codeLanguages: languages }) : 
          []
        ),
        // Keymaps
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        // Read only
        readOnlyComp.of(EditorState.readOnly.of(readOnly)),
        // Change listener
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swap theme when isDark changes ───────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        themeComp.reconfigure(buildEditorTheme(isDark)),
        hlComp.reconfigure(syntaxHighlighting(isDark ? darkHL : lightHL)),
      ],
    });
  }, [isDark]);

  // ── Reconfigure readOnly ─────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyComp.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // ── Reconfigure language ─────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: langComp.reconfigure(
        language === "html" ? htmlLang() : 
        language === "md" ? markdown({ base: markdownLanguage, codeLanguages: languages }) : 
        []
      ),
    });
  }, [language]);

  // ── Sync external value changes (file import) ────────────────────────
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
      className={`h-full w-full overflow-hidden ${className}`}
    />
  );
}
