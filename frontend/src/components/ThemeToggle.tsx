"use client";

import { useTheme } from "@/contexts/ThemeContext";

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

export function ThemeToggle({
  className = "",
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--card-border)] text-brand-fg transition-colors hover:border-brand-tertiary hover:text-brand-tertiary dark:border-neutral-600 dark:text-neutral-100 dark:hover:border-brand-tertiary ${className}`}
      >
        {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 font-brand text-fp-caption font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-brand-tertiary hover:text-brand-fg dark:border-neutral-600 dark:hover:border-brand-tertiary dark:hover:text-neutral-50 ${className}`}
      aria-label={label}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
