"use client";

import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  panelClassName = "max-w-lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind width class for dialog panel */
  panelClassName?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-fg/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-t-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl dark:border-neutral-700/70 sm:rounded-xl ${panelClassName}`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3 dark:border-neutral-700/70">
          <h2 className="font-brand-display text-fp-sub font-bold uppercase tracking-[0.1em] text-brand-fg dark:text-neutral-50">
            {title}
          </h2>
          <button
            type="button"
            className="font-brand text-fp-caption uppercase tracking-wider text-hcode-muted transition-colors hover:text-brand-tertiary hover:underline dark:hover:text-neutral-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
