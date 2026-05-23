"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";

type SessionPageVisitRow = {
  pageHitId: string;
  path: string;
  openedAt: string;
  sessionId: string;
  visitorId: string;
  sessionStartedAt: string;
  userAgent: string | null;
};

export default function AdminSessionsPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<SessionPageVisitRow[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const qs = new URLSearchParams({ page: String(page), limit: "25" });
    const res = await adminFetch(`/admin/analytics/session-pages?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      return;
    }
    const data = (await res.json()) as { items: SessionPageVisitRow[]; meta: PageMeta };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setErr(null);
  }, [token, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function shortId(id: string) {
    if (id.length <= 14) return id;
    return `${id.slice(0, 8)}…${id.slice(-6)}`;
  }

  if (!token) {
    return (
      <p className="text-sm text-hcode-muted">
        Sign in required.{" "}
        <a href="/admin/login" className="hcode-link">
          Login
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">Visitor sessions</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-hcode-muted">
          Recent page views from <code className="rounded bg-black/5 px-1 dark:bg-white/10">user_session_pages</code>, each linked to the raw browser session that recorded it (visitor id and session start come from{" "}
          <code className="rounded bg-black/5 px-1 dark:bg-white/10">user_sessions</code>). Newest page opens first; pagination is over page-hit rows.
        </p>
      </div>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="overflow-hidden border border-[var(--card-border)] bg-[var(--card-bg)] dark:border-neutral-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-black/[0.02] text-[10px] font-semibold uppercase tracking-wider text-hcode-muted dark:border-neutral-800 dark:bg-white/[0.03]">
                <th className="whitespace-nowrap px-3 py-3">Page opened</th>
                <th className="px-3 py-3">Path</th>
                <th className="whitespace-nowrap px-3 py-3">Visitor ID</th>
                <th className="whitespace-nowrap px-3 py-3">Session ID</th>
                <th className="whitespace-nowrap px-3 py-3">Session started</th>
                <th className="min-w-[140px] px-3 py-3">User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-hcode-muted">
                    No page visits recorded yet.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.pageHitId}
                    className="border-b border-[var(--card-border)] last:border-0 dark:border-neutral-800"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 align-top tabular-nums text-foreground">
                      {new Date(row.openedAt).toLocaleString()}
                    </td>
                    <td className="max-w-[280px] px-3 py-2.5 align-top font-mono text-[10px] text-foreground md:max-w-md">
                      <span className="break-all">{row.path}</span>
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono text-[10px]" title={row.visitorId}>
                      {shortId(row.visitorId)}
                    </td>
                    <td className="px-3 py-2.5 align-top font-mono text-[10px] text-hcode-muted" title={row.sessionId}>
                      {shortId(row.sessionId)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-top tabular-nums text-hcode-muted">
                      {new Date(row.sessionStartedAt).toLocaleString()}
                    </td>
                    <td className="max-w-xs px-3 py-2.5 align-top text-[10px] leading-snug text-hcode-muted">
                      <span className="line-clamp-3 break-all" title={row.userAgent ?? undefined}>
                        {row.userAgent?.trim() || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar meta={meta} onChange={setPage} />
      </div>
    </div>
  );
}
