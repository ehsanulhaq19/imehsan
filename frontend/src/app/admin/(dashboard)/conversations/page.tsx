"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { Modal } from "@/components/admin/Modal";
import { PaginationBar } from "@/components/admin/PaginationBar";

type Msg = { id: string; role: string; content: string; createdAt: string };
type Conv = {
  id: string;
  guestSessionId: string;
  guestName: string | null;
  guestEmail: string | null;
  updatedAt: string;
  messages?: Msg[];
};

export default function AdminConversationsPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<Conv[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Conv | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const qs = new URLSearchParams({ page: String(page), limit: "15", q });
    const res = await adminFetch(`/admin/ai/conversations?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      return;
    }
    const data = (await res.json()) as { items: Conv[]; meta: PageMeta };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setErr(null);
  }, [token, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(id: string) {
    if (!token) return;
    const res = await adminFetch(`/admin/ai/conversations/${id}`, token);
    if (!res.ok) return;
    const row = (await res.json()) as Conv;
    setDetail(row);
    setGuestName(row.guestName ?? "");
    setGuestEmail(row.guestEmail ?? "");
  }

  async function saveMeta(e: FormEvent) {
    e.preventDefault();
    if (!token || !detail) return;
    const res = await adminFetch(`/admin/ai/conversations/${detail.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        guestName: guestName.trim() || null,
        guestEmail: guestEmail.trim() || null,
      }),
    });
    if (!res.ok) setErr(`Update failed (${res.status})`);
    else {
      await load();
      await openDetail(detail.id);
    }
  }

  async function removeConv(id: string) {
    if (!token || !confirm("Delete this conversation?")) return;
    const res = await adminFetch(`/admin/ai/conversations/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else {
      setDetail(null);
      await load();
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-hcode-muted">
        Sign in required. <a href="/admin/login" className="hcode-link">Login</a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">Conversations</h1>
        <p className="mt-1 text-xs text-hcode-muted">AI widget threads with pagination.</p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(qInput.trim());
        }}
      >
        <input
          className="hcode-input max-w-xs normal-case"
          placeholder="Search…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
        />
        <button type="submit" className="hcode-btn-outline px-4 py-2 text-[10px]">
          Search
        </button>
      </form>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="overflow-x-auto border border-[var(--card-border)] bg-[var(--card-bg)] dark:border-neutral-700">
        <table className="min-w-full border-collapse text-left text-[11px]">
          <thead className="border-b border-[var(--card-border)] bg-hcode-gray/80 dark:border-neutral-700 dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Session</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Guest</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Updated</th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[var(--card-border)] dark:border-neutral-800">
                <td className="max-w-[140px] truncate px-3 py-2 font-mono text-[10px]">{row.guestSessionId}</td>
                <td className="max-w-[160px] truncate px-3 py-2">{row.guestName || row.guestEmail || "—"}</td>
                <td className="px-3 py-2 text-hcode-muted">{new Date(row.updatedAt).toLocaleString()}</td>
                <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                  <button type="button" className="text-[10px] font-semibold uppercase text-hcode-violet" onClick={() => void openDetail(row.id)}>
                    View
                  </button>
                  <button type="button" className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400" onClick={() => void removeConv(row.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar meta={meta} onChange={setPage} />
      </div>

      <Modal
        open={detail !== null}
        title="Conversation"
        onClose={() => setDetail(null)}
        footer={
          detail ? (
            <>
              <button type="button" className="hcode-btn-outline px-4 py-2 text-[10px]" onClick={() => void removeConv(detail.id)}>
                Delete thread
              </button>
              <button type="button" className="hcode-btn-outline px-4 py-2 text-[10px]" onClick={() => setDetail(null)}>
                Close
              </button>
            </>
          ) : null
        }
      >
        {detail ? (
          <div className="space-y-4">
            <form onSubmit={saveMeta} className="space-y-2 border-b border-[var(--card-border)] pb-4 dark:border-neutral-700">
              <label className="block text-[11px] font-semibold uppercase tracking-wider">
                Guest name
                <input className="hcode-input normal-case" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-wider">
                Guest email
                <input type="email" className="hcode-input normal-case tracking-normal" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              </label>
              <button type="submit" className="hcode-btn px-4 py-2 text-[10px]">
                Save guest fields
              </button>
            </form>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto text-[11px]">
              {(detail.messages ?? []).map((m) => (
                <div key={m.id} className={`rounded border border-[var(--card-border)] p-2 dark:border-neutral-700 ${m.role === "user" ? "bg-hcode-gray/50 dark:bg-neutral-900/80" : ""}`}>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-hcode-muted">{m.role}</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground">{m.content}</p>
                  <p className="mt-1 text-[9px] text-hcode-muted">{new Date(m.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
