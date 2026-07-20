import React from "react";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "accent" | "secondary" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export default function Button3D({
  children,
  variant = "accent",
  size = "md",
  className = "",
  ...props
}: Button3DProps) {
  const base = [
    "inline-flex items-center justify-center gap-1.5",
    "font-display font-semibold rounded-xl",
    "transition-all duration-150 cursor-pointer select-none",
    "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/60 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--bg-2)]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" ");

  const sizes: Record<string, string> = {
    xs: "h-7  px-3   text-[11px] tracking-wide",
    sm: "h-8  px-4   text-xs     tracking-wide",
    md: "h-9  px-5   text-sm",
    lg: "h-11 px-7   text-base",
  };

  const variants: Record<string, string> = {
    accent:
      "bg-[var(--accent)] text-white " +
      "shadow-[var(--shadow-accent)] " +
      "hover:bg-[var(--accent-h)] hover:shadow-[5px_5px_14px_rgba(120,121,241,0.40),-3px_-3px_10px_var(--neu-light)] " +
      "active:scale-[0.96] active:shadow-[var(--shadow-accent-in)]",

    secondary:
      "text-[var(--text-1)] theme-transition " +
      "shadow-[var(--shadow-out-sm)] bg-[var(--bg-2)] " +
      "hover:bg-[var(--bg-3)] hover:shadow-[var(--shadow-out)] " +
      "active:scale-[0.96] active:shadow-[var(--shadow-in-sm)] active:bg-[var(--bg)]",

    ghost:
      "text-[var(--text-2)] bg-transparent " +
      "hover:bg-[var(--bg-3)] hover:text-[var(--text-1)] " +
      "active:scale-[0.96]",

    danger:
      "text-white bg-[var(--accent-rose)] " +
      "shadow-[4px_4px_10px_rgba(224,112,144,0.35),-2px_-2px_7px_var(--neu-light)] " +
      "hover:opacity-90 active:scale-[0.96]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
