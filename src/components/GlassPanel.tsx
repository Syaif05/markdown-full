import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Use inset neumorphic shadow (for wells, inputs) */
  inset?: boolean;
  /** Use glass morphism (for floating navbar, modals) */
  glass?: boolean;
  /** Border radius size */
  radius?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const radiusMap = {
  sm:  "rounded-lg",
  md:  "rounded-xl",
  lg:  "rounded-2xl",
  xl:  "rounded-3xl",
  "2xl": "rounded-[28px]",
};

export default function GlassPanel({
  children,
  className = "",
  inset = false,
  glass = false,
  radius = "2xl",
  ...props
}: GlassPanelProps) {
  const base = radiusMap[radius];

  if (glass) {
    return (
      <div
        className={`glass theme-transition ${base} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${inset ? "neu-in" : "neu-out"} theme-transition ${base} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
