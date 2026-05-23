"use client";

import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl dark:border-neutral-700 sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3 dark:border-neutral-700">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-black dark:text-neutral-100">
            {title}
          </h2>
          <button
            type="button"
            className="text-[11px] uppercase tracking-wider text-hcode-muted hover:text-black dark:hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
