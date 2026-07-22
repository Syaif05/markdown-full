"use client";

import { useState } from "react";

interface Props {
  mode: "split" | "wysiwyg";
  setMode: (m: "split" | "wysiwyg") => void;
}

export default function LiquidGlassToggle({ mode, setMode }: Props) {
  const [shimmer, setShimmer] = useState(false);

  const handleToggle = (m: "split" | "wysiwyg") => {
    if (m === mode) return;
    setShimmer(true);
    setMode(m);
    setTimeout(() => setShimmer(false), 700);
  };

  const isLeft = mode === "split";

  return (
    <div className="relative select-none" style={{ width: 222 }}>
      {/* ─── SVG Gooey filter definition ───────────────────────────── */}
      <svg
        aria-hidden
        style={{ display: "none", position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter
            id="goo-toggle"
            x="-15%"
            y="-40%"
            width="130%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            {/* Step 1: Blur the shapes */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            {/* Step 2: Sharpen alpha → makes blurred edges snap into liquid blobs */}
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -12"
              result="goo"
            />
            {/* Step 3: Overlay crisp original on top of goo for clean color */}
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ─── Outer track ──────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-visible"
        style={{
          height: 42,
          background: "var(--bg)",
          boxShadow: "var(--shadow-in)",
          padding: "4px",
        }}
      >
        {/* ── Gooey layer: only the sliding pill lives here ─────── */}
        {/*    The filter is applied to this layer, not the text.   */}
        <div
          className="absolute rounded-2xl overflow-hidden"
          style={{
            inset: "4px",
            filter: "url(#goo-toggle)",
            /* pointer-events off so labels are clickable */
            pointerEvents: "none",
          }}
        >
          {/* Sliding pill */}
          <div
            className="absolute top-0 bottom-0 rounded-xl"
            style={{
              left: isLeft ? 0 : "50%",
              width: "50%",
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%)",
              transition: "left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: "0 2px 12px rgba(37,99,235,0.40)",
            }}
          />
        </div>

        {/* ── Glass refraction overlay ───────────────────────────── */}
        <div
          className="absolute rounded-2xl pointer-events-none"
          style={{
            inset: "4px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.07) 100%)",
          }}
        />

        {/* ── Shimmer sweep on click ─────────────────────────────── */}
        <div
          className="absolute rounded-2xl pointer-events-none overflow-hidden"
          style={{ inset: "4px" }}
        >
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.30) 50%, transparent 100%)",
              opacity: shimmer ? 1 : 0,
              animation: shimmer ? "glass-sweep 0.55s ease-out forwards" : "none",
            }}
          />
        </div>

        {/* ── Text labels (above gooey layer, always crisp) ────────── */}
        <div className="relative z-20 flex h-full" style={{ gap: 2 }}>
          {(["split", "wysiwyg"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleToggle(m)}
              className="flex-1 text-center text-[11.5px] font-display font-bold
                         rounded-xl transition-colors duration-300 cursor-pointer"
              style={{
                color: mode === m ? "#ffffff" : "var(--text-3)",
                textShadow:
                  mode === m ? "0 1px 4px rgba(0,0,0,0.25)" : "none",
              }}
            >
              {m === "split" ? "Split View" : "WYSIWYG"}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Mode indicator dot below toggle ────────────────────────── */}
      <div className="flex justify-center mt-1.5 gap-1.5">
        {(["split", "wysiwyg"] as const).map((m) => (
          <div
            key={m}
            className="rounded-full transition-all duration-400"
            style={{
              width: mode === m ? 14 : 5,
              height: 5,
              background: mode === m ? "var(--accent)" : "var(--text-3)",
              opacity: mode === m ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
