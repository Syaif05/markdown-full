import React from "react";

interface Button3DProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "glass";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button3D({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Button3DProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-150 active:scale-[0.96] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-7 py-3.5 text-base tracking-wide",
  };

  const variantStyles = {
    primary:
      "bg-brand-accent text-white shadow-skeuo-button hover:shadow-skeuo-button-hover active:shadow-skeuo-press active:translate-y-[1px] hover:bg-brand-accent-hover",
    secondary:
      "bg-brand-surface text-brand-ink border border-brand-ink/5 shadow-skeuo-button hover:shadow-skeuo-button-hover active:shadow-skeuo-press active:translate-y-[1px] hover:bg-brand-ink/5",
    glass:
      "bg-brand-glass backdrop-blur-md text-brand-ink glass-border-refraction shadow-skeuo-button hover:shadow-skeuo-button-hover active:shadow-skeuo-press active:translate-y-[1px] hover:bg-white/80",
    danger:
      "bg-red-500 text-white shadow-skeuo-button hover:shadow-skeuo-button-hover active:shadow-skeuo-press active:translate-y-[1px] hover:bg-red-600",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
