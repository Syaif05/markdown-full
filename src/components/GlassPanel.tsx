import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Adds elevated hover shadow */
  elevated?: boolean;
  /** Uses inset shadow for pressed/input look */
  inset?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  elevated = false,
  inset = false,
  ...props
}: GlassPanelProps) {
  const shadow = inset
    ? "shadow-[inset_3px_3px_8px_rgba(59,110,248,0.1),inset_-3px_-3px_8px_rgba(255,255,255,0.85)]"
    : elevated
    ? "shadow-[6px_6px_18px_rgba(59,110,248,0.12),-4px_-4px_12px_rgba(255,255,255,1)]"
    : "shadow-[6px_6px_16px_rgba(59,110,248,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]";

  return (
    <div
      className={`bg-white rounded-2xl ${shadow} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
