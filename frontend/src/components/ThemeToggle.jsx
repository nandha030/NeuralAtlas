import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = ({ className = "" }) => {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      className={`w-9 h-9 rounded-full border border-[var(--na-border-strong)] flex items-center justify-center hover:bg-[color-mix(in_oklab,var(--na-text)_6%,transparent)] transition-colors ${className}`}
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4 text-[var(--na-gold)]" />
        : <Moon className="w-4 h-4 text-[var(--na-text)]" />}
    </button>
  );
};
