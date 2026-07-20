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

// ── Syntax highlight — Light (calm indigo palette) ───────────────────────
const lightHL = HighlightStyle.define([
  { tag: tags.heading1,   color: "#5B5CF0", fontWeight: "800", fontSize: "1.05em" },
  { tag: tags.heading2,   color: "#5B5CF0", fontWeight: "700" },
  { tag: tags.heading3,   color: "#7879F1", fontWeight: "700" },
  { tag: tags.heading4,   color: "#7879F1", fontWeight: "600" },
  { tag: tags.strong,     color: "#2B2E50", fontWeight: "700" },
  { tag: tags.emphasis,   color: "#9050CF", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#9498B8", textDecoration: "line-through" },
  { tag: tags.link,       color: "#5BB8B4", textDecoration: "underline" },
  { tag: tags.url,        color: "#5BB8B4", fontStyle: "italic" },
  { tag: tags.monospace,  color: "#9050CF", background: "rgba(144,80,207,0.10)", borderRadius: "3px", padding: "0 3px" },
  { tag: tags.processingInstruction, color: "#9498B8" },
  { tag: tags.meta,       color: "#7879F1" },
  { tag: tags.comment,    color: "#9498B8", fontStyle: "italic" },
  { tag: tags.keyword,    color: "#5B5CF0", fontWeight: "600" },
  { tag: tags.string,     color: "#A05060" },
  { tag: tags.number,     color: "#427A5F" },
  { tag: tags.bool,       color: "#5B5CF0", fontWeight: "600" },
  { tag: tags.operator,   color: "#5E6387" },
  { tag: tags.punctuation, color: "#9498B8" },
  { tag: tags.bracket,    color: "#7879F1" },
  { tag: tags.typeName,   color: "#5BB8B4" },
  { tag: tags.function(tags.variableName), color: "#7050A0" },
  { tag: tags.definition(tags.variableName), color: "#5B5CF0" },
]);

// ── Syntax highlight — Dark (calm VSCode Dark+ palette) ──────────────────
const darkHL = HighlightStyle.define([
  { tag: tags.heading1,   color: "#A5A6FA", fontWeight: "800", fontSize: "1.05em" },
  { tag: tags.heading2,   color: "#9B9CF8", fontWeight: "700" },
  { tag: tags.heading3,   color: "#8B8CF0", fontWeight: "700" },
  { tag: tags.heading4,   color: "#8B8CF0", fontWeight: "600" },
  { tag: tags.strong,     color: "#E0E2F0", fontWeight: "700" },
  { tag: tags.emphasis,   color: "#C48FE8", fontStyle: "italic" },
  { tag: tags.strikethrough, color: "#52567A", textDecoration: "line-through" },
  { tag: tags.link,       color: "#5DC9C0", textDecoration: "underline" },
  { tag: tags.url,        color: "#5DC9C0", fontStyle: "italic" },
  { tag: tags.monospace,  color: "#C48FE8", background: "rgba(196,143,232,0.12)", borderRadius: "3px", padding: "0 3px" },
  { tag: tags.processingInstruction, color: "#52567A" },
  { tag: tags.meta,       color: "#8B8CF0" },
  { tag: tags.comment,    color: "#52567A", fontStyle: "italic" },
  { tag: tags.keyword,    color: "#A5A6FA", fontWeight: "600" },
  { tag: tags.string,     color: "#F8C0A0" },
  { tag: tags.number,     color: "#B5CEA8" },
  { tag: tags.bool,       color: "#A5A6FA", fontWeight: "600" },
  { tag: tags.operator,   color: "#C9CBD2" },
  { tag: tags.punctuation, color: "#8488A8" },
  { tag: tags.bracket,    color: "#A5A6FA" },
  { tag: tags.typeName,   color: "#5DC9C0" },
  { tag: tags.function(tags.variableName), color: "#E8C87A" },
  { tag: tags.definition(tags.variableName), color: "#A5A6FA" },
]);

// ── Editor theme — base styles (reading --ed-* from CSS vars) ────────────
function buildEditorTheme(dark: boolean) {
  return EditorView.theme(
    {
      "&": {
        fontSize: "13.5px",
        fontFamily:
          "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Mono', monospace",
        height: "100%",
        backgroundColor: "var(--ed-bg)",
      },
      ".cm-scroller": {
        fontFamily: "inherit",
        lineHeight: "1.75",
        overflow: "auto",
      },
      ".cm-content": {
        caretColor: "var(--ed-cursor)",
        padding: "14px 14px 60px 10px",
        minHeight: "100%",
      },
      ".cm-cursor": {
        borderLeftColor: "var(--ed-cursor)",
        borderLeftWidth: "2px",
      },
      ".cm-selectionBackground": { background: "var(--ed-selection)" },
      "& .cm-selectionBackground": { background: "var(--ed-selection)" },
      ".cm-line": { color: "var(--text-1)" },
      ".cm-gutters": {
        background: "var(--ed-gutter-bg)",
        borderRight: "1px solid var(--border-subtle)",
        color: "var(--ed-gutter-fg)",
        paddingRight: "4px",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        fontSize: "11px",
        minWidth: "38px",
        paddingLeft: "4px",
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
        background: "rgba(120,121,241,0.18)",
        outline: "1px solid rgba(120,121,241,0.45)",
        borderRadius: "3px",
      },
    },
    { dark }
  );
}

// ── Compartments (module-level — one instance for the whole app) ─────────
const themeComp = new Compartment();
const hlComp    = new Compartment();

interface Props {
  value: string;
  onChange: (val: string) => void;
  isDark: boolean;
  className?: string;
}

export default function CodeMirrorEditor({
  value,
  onChange,
  isDark,
  className = "",
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
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        // Keymaps
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
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
