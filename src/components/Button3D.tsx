import React from "react";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export default function Button3D({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Button3DProps) {
  const base =
    "inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes: Record<string, string> = {
    xs: "px-3 py-1.5 text-[11px] gap-1",
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2",
  };

  const variants: Record<string, string> = {
    primary:
      "bg-blue-500 text-white " +
      "shadow-[4px_4px_10px_rgba(59,110,248,0.35),-2px_-2px_6px_rgba(255,255,255,0.5)] " +
      "hover:bg-blue-600 hover:shadow-[5px_5px_14px_rgba(59,110,248,0.4),-2px_-2px_8px_rgba(255,255,255,0.6)] " +
      "active:scale-[0.97] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2)]",

    secondary:
      "bg-white text-blue-600 border border-blue-100 " +
      "shadow-[4px_4px_10px_rgba(59,110,248,0.08),-2px_-2px_6px_rgba(255,255,255,0.9)] " +
      "hover:bg-blue-50 hover:border-blue-200 " +
      "active:scale-[0.97] active:shadow-[inset_2px_2px_5px_rgba(59,110,248,0.12)]",

    ghost:
      "bg-transparent text-ink-2 hover:bg-blue-50 hover:text-blue-600 " +
      "active:scale-[0.97]",
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
