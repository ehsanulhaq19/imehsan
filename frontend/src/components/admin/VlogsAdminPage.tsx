"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { assetUrl } from "@/api/client";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { Modal } from "@/components/admin/Modal";
import { PaginationBar } from "@/components/admin/PaginationBar";

type MediaRef = {
  id: string;
  path: string;
  mimeType: string;
  originalName: string | null;
};

type VlogMediaPivot = {
  id: string;
  role: string;
  mediaId: string;
  media?: MediaRef | null;
};

type VlogRow = {
  id: string;
  slug: string;
  heading: string;
  description?: string | null;
  published: boolean;
  sortOrder?: number | null;
  mediaItems?: VlogMediaPivot[] | null;
};

const MEDIA_ROLES = [
  { value: "video", label: "video (main)" },
  { value: "thumbnail", label: "thumbnail" },
  { value: "poster", label: "poster" },
  { value: "attachment", label: "attachment" },
];

export function VlogsAdminPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<VlogRow[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editRow, setEditRow] = useState<VlogRow | null>(null);
  const [slug, setSlug] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [published, setPublished] = useState(false);
  const [attachRole, setAttachRole] = useState("video");
  const [attachById, setAttachById] = useState("");
  const [busyUpload, setBusyUpload] = useState(false);

  const activeVlogId = editRow?.id ?? null;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    const qs = new URLSearchParams({ page: String(page), limit: "15", q });
    const res = await adminFetch(`/admin/vlogs?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: VlogRow[]; meta: PageMeta };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setLoading(false);
  }, [token, page, q]);

  const refreshEditRow = useCallback(
    async (id: string) => {
      if (!token) return;
      const qs = new URLSearchParams({ page: String(page), limit: "15", q });
      const listRes = await adminFetch(`/admin/vlogs?${qs}`, token);
      if (!listRes.ok) return;
      const data = (await listRes.json()) as { items: VlogRow[] };
      const row = data.items.find((v) => v.id === id);
      if (row) setEditRow(row);
    },
    [token, page, q],
  );

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setSlug("");
    setHeading("");
    setDescription("");
    setSortOrder("");
    setPublished(false);
    setAttachRole("video");
    setAttachById("");
    setEditRow(null);
    setModal("create");
  }

  function openEdit(row: VlogRow) {
    setEditRow(row);
    setSlug(row.slug);
    setHeading(row.heading);
    setDescription(row.description ?? "");
    setSortOrder(row.sortOrder != null ? String(row.sortOrder) : "");
    setPublished(Boolean(row.published));
    setAttachRole("video");
    setAttachById("");
    setModal("edit");
  }

  async function saveVlog(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const body: Record<string, unknown> = {
      slug: slug.trim(),
      heading: heading.trim(),
      description: description.trim() || undefined,
      published,
    };
    if (sortOrder.trim() !== "") body.sortOrder = Number(sortOrder);

    if (modal === "create") {
      const res = await adminFetch("/admin/vlogs", token, { method: "POST", body: JSON.stringify(body) });
      if (!res.ok) setErr(`Create failed (${res.status})`);
      else {
        const created = (await res.json()) as VlogRow;
        setEditRow(created);
        setModal("edit");
        await load();
      }
      return;
    }

    if (modal === "edit" && editRow) {
      const res = await adminFetch(`/admin/vlogs/${editRow.id}`, token, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) setErr(`Update failed (${res.status})`);
      else {
        const updated = (await res.json()) as VlogRow;
        setEditRow(updated);
        await load();
      }
    }
  }

  async function attachMedia(mediaId: string, role: string) {
    if (!token || !activeVlogId || !mediaId.trim()) return;
    const res = await adminFetch(`/admin/vlogs/${activeVlogId}/media`, token, {
      method: "POST",
      body: JSON.stringify({ mediaId: mediaId.trim(), role }),
    });
    if (!res.ok) setErr(`Attach failed (${res.status})`);
    else {
      setAttachById("");
      await load();
      await refreshEditRow(activeVlogId);
    }
  }

  async function uploadAndAttach(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !activeVlogId) return;
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || !file.size) return;
    setBusyUpload(true);
    const up = new FormData();
    up.append("file", file);
    const upRes = await adminFetch("/admin/media/upload", token, { method: "POST", body: up });
    setBusyUpload(false);
    if (!upRes.ok) {
      setErr(`Upload failed (${upRes.status})`);
      return;
    }
    const j = (await upRes.json()) as { id: string };
    e.currentTarget.reset();
    await attachMedia(j.id, attachRole);
  }

  async function detachPivot(pivotId: string) {
    if (!token || !activeVlogId || !confirm("Remove this media link?")) return;
    const res = await adminFetch(`/admin/vlogs/${activeVlogId}/media/${pivotId}`, token, {
      method: "DELETE",
    });
    if (!res.ok) setErr(`Detach failed (${res.status})`);
    else {
      await load();
      await refreshEditRow(activeVlogId);
    }
  }

  async function deleteVlog(id: string) {
    if (!token || !confirm("Delete this vlog?")) return;
    const res = await adminFetch(`/admin/vlogs/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else {
      setModal(null);
      await load();
    }
  }

  const pivots = editRow?.mediaItems ?? [];

  if (!token) {
    return (
      <p className="text-sm text-hcode-muted">
        Sign in required. <a href="/admin/login" className="hcode-link">Login</a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">Vlogs</h1>
          <p className="mt-1 text-xs text-hcode-muted">Manage posts, publish flags, and linked media (video, thumbnails).</p>
        </div>
        <button type="button" className="hcode-btn px-4 py-2 text-[10px]" onClick={openCreate}>
          New vlog
        </button>
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
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Slug</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Heading</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Media</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wider">Published</th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-hcode-muted">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-hcode-muted">
                  No vlogs
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-b border-[var(--card-border)] dark:border-neutral-800">
                  <td className="max-w-[120px] truncate px-3 py-2">{row.slug}</td>
                  <td className="max-w-[180px] truncate px-3 py-2">{row.heading}</td>
                  <td className="px-3 py-2 text-hcode-muted">{row.mediaItems?.length ?? 0}</td>
                  <td className="px-3 py-2">{row.published ? "yes" : "no"}</td>
                  <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                    <button type="button" className="text-[10px] font-semibold uppercase text-hcode-violet" onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button type="button" className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400" onClick={() => void deleteVlog(row.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationBar meta={meta} onChange={setPage} />
      </div>

      <Modal
        open={modal !== null}
        title={modal === "create" ? "New vlog" : "Edit vlog"}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="hcode-btn-outline px-4 py-2 text-[10px]" onClick={() => setModal(null)}>
              Close
            </button>
            {modal === "edit" && editRow ? (
              <button type="button" className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400" onClick={() => void deleteVlog(editRow.id)}>
                Delete vlog
              </button>
            ) : null}
            <button type="submit" form="vlog-form" className="hcode-btn px-4 py-2 text-[10px]">
              Save
            </button>
          </>
        }
      >
        <form id="vlog-form" className="space-y-3" onSubmit={saveVlog}>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
            Slug
            <input className="hcode-input normal-case tracking-normal" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
            Heading
            <input className="hcode-input normal-case tracking-normal" value={heading} onChange={(e) => setHeading(e.target.value)} required />
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
            Description
            <textarea
              className="mt-1 min-h-[72px] w-full border border-hcode-input bg-white px-3 py-2 text-[11px] normal-case dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
            Sort order
            <input type="number" className="hcode-input normal-case tracking-normal" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
            Published
          </label>
        </form>

        {modal === "edit" && activeVlogId ? (
          <div className="mt-6 border-t border-[var(--card-border)] pt-4 dark:border-neutral-700">
            <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-black dark:text-neutral-100">Media</h3>
            <p className="mt-1 text-[10px] text-hcode-muted">Upload a file or paste an existing media ID from the Media library.</p>

            <ul className="mt-3 space-y-2 text-[11px]">
              {pivots.length === 0 ? (
                <li className="text-hcode-muted">No media attached.</li>
              ) : (
                pivots.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border border-[var(--card-border)] px-2 py-2 dark:border-neutral-700">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold uppercase text-hcode-violet">{p.role}</span>
                      <span className="text-hcode-muted"> · {p.mediaId.slice(0, 8)}…</span>
                      {p.media?.path ? (
                        <div className="mt-1 truncate text-[10px]">
                          <a href={assetUrl(p.media.path)} target="_blank" rel="noreferrer" className="hcode-link">
                            {p.media.originalName || p.media.path}
                          </a>
                          <span className="text-hcode-muted"> ({p.media.mimeType})</span>
                        </div>
                      ) : null}
                      {p.media?.mimeType?.startsWith("image/") && p.media?.path ? (
                        <img src={assetUrl(p.media.path)} alt="" className="mt-2 h-16 max-w-[120px] border border-[var(--card-border)] object-cover dark:border-neutral-700" />
                      ) : null}
                    </div>
                    <button type="button" className="text-[10px] uppercase text-red-600 dark:text-red-400" onClick={() => void detachPivot(p.id)}>
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-4 space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
                Role for new upload / attach
                <select className="mt-1 hcode-input normal-case" value={attachRole} onChange={(e) => setAttachRole(e.target.value)}>
                  {MEDIA_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <form onSubmit={uploadAndAttach} className="flex flex-wrap items-end gap-2 border border-[var(--card-border)] p-3 dark:border-neutral-700">
                <label className="block text-[10px] font-semibold uppercase tracking-wider">
                  Upload file
                  <input name="file" type="file" className="mt-1 block w-full text-[11px]" />
                </label>
                <button type="submit" className="hcode-btn px-3 py-2 text-[10px]" disabled={busyUpload}>
                  {busyUpload ? "…" : "Upload & attach"}
                </button>
              </form>
              <div className="flex flex-wrap items-end gap-2">
                <label className="block flex-1 text-[10px] font-semibold uppercase tracking-wider">
                  Media ID (UUID)
                  <input className="hcode-input normal-case tracking-normal" value={attachById} onChange={(e) => setAttachById(e.target.value)} placeholder="paste UUID" />
                </label>
                <button type="button" className="hcode-btn-outline px-3 py-2 text-[10px]" onClick={() => void attachMedia(attachById, attachRole)}>
                  Attach
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {modal === "create" ? (
          <p className="mt-4 text-[10px] text-hcode-muted">Save once to enable media upload and attachments.</p>
        ) : null}
      </Modal>
    </div>
  );
}
