"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-28 rounded-lg" />;

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="rounded-lg border-2 border-retro-border bg-retro-surface px-4 py-1.5 text-sm font-semibold text-retro-text transition-colors hover:border-retro-primary hover:text-retro-primary"
    >
      {theme === "light" ? "◑ Night" : "☀ Day"}
    </button>
  );
}
