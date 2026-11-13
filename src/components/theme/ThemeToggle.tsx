"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Tactile square Dark/Light theme switcher styled after Neramit AI's header toggle.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = !mounted || theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "สลับเป็นโหมดสว่าง (Light Mode)" : "สลับเป็นโหมดมืด (Dark Mode)"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "neu-raised relative grid size-8 sm:size-9 place-items-center rounded-xl border border-[var(--border-control)] text-amber-400 dark:text-amber-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-400/50 hover:shadow-[0_0_16px_rgba(139,92,246,0.28)] active:translate-y-0 cursor-pointer",
        !isDark && "text-violet-700 hover:border-violet-500/40",
        className
      )}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="size-4 transition-transform duration-300" />
      )}
    </button>
  );
}
