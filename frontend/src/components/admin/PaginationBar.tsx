"use client";

import type { PageMeta } from "@/lib/admin-fetch";

export function PaginationBar({
  meta,
  onChange,
}: {
  meta: PageMeta | null;
  onChange: (page: number) => void;
}) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--card-border)] px-3 py-2 text-[11px] dark:border-neutral-700">
      <span className="text-hcode-muted">
        Page {meta.page} / {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="hcode-btn-outline px-3 py-2 text-[10px]"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          Prev
        </button>
        <button
          type="button"
          className="hcode-btn-outline px-3 py-2 text-[10px]"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
