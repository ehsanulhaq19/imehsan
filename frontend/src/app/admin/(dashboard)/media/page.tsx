"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { assetUrl } from "@/api/client";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { PaginationBar } from "@/components/admin/PaginationBar";

export default function AdminMediaPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<{ id: string; path: string; mimeType: string; originalName: string | null }[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const qs = new URLSearchParams({ page: String(page), limit: "15", q });
    const res = await adminFetch(`/admin/media?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      return;
    }
    const data = (await res.json()) as {
      items: { id: string; path: string; mimeType: string; originalName: string | null }[];
      meta: PageMeta;
    };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setErr(null);
  }, [token, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || !file.size) return;
    setBusy(true);
    const up = new FormData();
    up.append("file", file);
    const res = await adminFetch("/admin/media/upload", token, { method: "POST", body: up });
    setBusy(false);
    if (!res.ok) setErr(`Upload failed (${res.status})`);
    else {
      e.currentTarget.reset();
      await load();
    }
  }

  async function onDelete(id: string) {
    if (!token || !confirm("Delete this media record?")) return;
    const res = await adminFetch(`/admin/media/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else await load();
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
        <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">Media</h1>
        <p className="mt-1 text-xs text-hcode-muted">Upload files and manage stored references.</p>
      </div>

      <form onSubmit={onUpload} className="flex flex-wrap items-end gap-3 border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
          File
          <input name="file" type="file" className="mt-1 block w-full text-[11px]" />
        </label>
        <button type="submit" className="hcode-btn px-4 py-2 text-[10px]" disabled={busy}>
          {busy ? "Uploading…" : "Upload"}
        </button>
      </form>

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
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Preview</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Name</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">MIME</th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-[var(--card-border)] dark:border-neutral-800">
                <td className="px-3 py-2">
                  {row.mimeType.startsWith("image/") ? (
                    <img src={assetUrl(row.path)} alt="" className="h-12 w-12 border border-[var(--card-border)] object-cover dark:border-neutral-700" />
                  ) : (
                    <span className="text-hcode-muted">—</span>
                  )}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2">{row.originalName || row.path}</td>
                <td className="px-3 py-2 text-hcode-muted">{row.mimeType}</td>
                <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                  <a href={assetUrl(row.path)} target="_blank" rel="noreferrer" className="text-[10px] font-semibold uppercase text-hcode-violet">
                    Open
                  </a>
                  <button type="button" className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400" onClick={() => void onDelete(row.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationBar meta={meta} onChange={setPage} />
      </div>
    </div>
  );
}
