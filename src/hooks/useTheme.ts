"use client";

import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  // Sync with DOM on mount (DOM was set by layout script)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    // Watch for external changes (e.g. system preference change)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("glassmark-theme", next ? "dark" : "light");
    } catch (_) { /* ignore */ }
    setIsDark(next);
  }, [isDark]);

  return { isDark, toggle };
}
