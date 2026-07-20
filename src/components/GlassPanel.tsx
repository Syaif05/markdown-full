import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  elevated = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={`
        relative rounded-2xl 
        bg-brand-glass backdrop-blur-[20px] 
        glass-border-refraction
        transition-all duration-300 ease-out
        ${elevated ? "shadow-elevated -translate-y-0.5" : "shadow-soft"}
        ${className}
      `}
      {...props}
    >
      {/* Fallback support for older browsers that do not support backdrop-filter */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-white/70 pointer-events-none" />
      {children}
    </div>
  );
}
