"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "@/api/client";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { sanitizeAdminSlug, slugifyFromHeading } from "@/lib/admin-slug";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { Modal } from "@/components/admin/Modal";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { stripHtmlToPlainText } from "@/lib/html-plain";

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

type Engagement = {
  comments: number;
  likes: number;
  dislikes: number;
};

export type VlogRow = {
  id: string;
  slug: string;
  heading: string;
  description?: string | null;
  published: boolean;
  sortOrder?: number | null;
  mediaItems?: VlogMediaPivot[] | null;
  engagement?: Engagement;
};

type CommentRow = {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

type VoteRow = {
  id: string;
  visitorKey: string;
  value: number;
  createdAt: string;
};

const MEDIA_ROLES = [
  { value: "video", label: "video (main)" },
  { value: "thumbnail", label: "thumbnail" },
  { value: "poster", label: "poster" },
  { value: "attachment", label: "attachment" },
];

type EngagementTab = "comments" | "reactions";

function EngagementModalBody({
  vlog,
  token,
  onChanged,
}: {
  vlog: VlogRow;
  token: string;
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<EngagementTab>("comments");
  const [cPage, setCPage] = useState(1);
  const [cMeta, setCMeta] = useState<PageMeta | null>(null);
  const [cItems, setCItems] = useState<CommentRow[]>([]);
  const [cLoading, setCLoading] = useState(true);
  const [cQInput, setCQInput] = useState("");
  const [cQ, setCQ] = useState("");

  const [vPage, setVPage] = useState(1);
  const [vMeta, setVMeta] = useState<PageMeta | null>(null);
  const [vItems, setVItems] = useState<VoteRow[]>([]);
  const [vLoading, setVLoading] = useState(true);
  const [vQInput, setVQInput] = useState("");
  const [vQ, setVQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<CommentRow | null>(null);
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const loadComments = useCallback(async () => {
    setCLoading(true);
    setErr(null);
    const qs = new URLSearchParams({ page: String(cPage), limit: "15", q: cQ });
    const res = await adminFetch(`/admin/vlogs/${vlog.id}/comments?${qs}`, token);
    if (!res.ok) {
      setErr(`Comments failed (${res.status})`);
      setCLoading(false);
      return;
    }
    const data = (await res.json()) as { items: CommentRow[]; meta: PageMeta };
    setCItems(data.items ?? []);
    setCMeta(data.meta ?? null);
    setCLoading(false);
  }, [token, vlog.id, cPage, cQ]);

  const loadVotes = useCallback(async () => {
    setVLoading(true);
    setErr(null);
    const qs = new URLSearchParams({ page: String(vPage), limit: "15", q: vQ });
    const res = await adminFetch(`/admin/vlogs/${vlog.id}/votes?${qs}`, token);
    if (!res.ok) {
      setErr(`Reactions failed (${res.status})`);
      setVLoading(false);
      return;
    }
    const data = (await res.json()) as { items: VoteRow[]; meta: PageMeta };
    setVItems(data.items ?? []);
    setVMeta(data.meta ?? null);
    setVLoading(false);
  }, [token, vlog.id, vPage, vQ]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (tab === "reactions") void loadVotes();
  }, [tab, loadVotes]);

  async function patchComment(row: CommentRow) {
    if (!token) return;
    const res = await adminFetch(`/admin/vlogs/comments/${row.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ authorName: draftAuthor.trim() || null, body: draftBody.trim() }),
    });
    if (!res.ok) setErr(`Update failed (${res.status})`);
    else {
      setEditing(null);
      void loadComments();
      onChanged();
    }
  }

  async function deleteComment(id: string) {
    if (!token || !confirm("Delete this comment?")) return;
    const res = await adminFetch(`/admin/vlogs/comments/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else {
      void loadComments();
      onChanged();
    }
  }

  async function deleteVote(id: string) {
    if (!token || !confirm("Remove this reaction?")) return;
    const res = await adminFetch(`/admin/vlogs/votes/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else {
      void loadVotes();
      onChanged();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--card-border)] pb-3 dark:border-neutral-700/70">
        <div className="min-w-0">
          <p className="font-brand-mono truncate text-fp-caption text-brand-tertiary">/{vlog.slug}</p>
          <p className="font-brand mt-1 text-fp-small leading-snug text-hcode-muted">
            Table counts: {vlog.engagement?.comments ?? 0} comments · {vlog.engagement?.likes ?? 0} likes ·{" "}
            {vlog.engagement?.dislikes ?? 0} dislikes
          </p>
        </div>
        <a
          href={`/vlogs/${encodeURIComponent(vlog.slug)}`}
          target="_blank"
          rel="noreferrer"
          className="hcode-link font-brand shrink-0 text-fp-caption"
          onClick={(e) => e.stopPropagation()}
        >
          Open public page →
        </a>
      </div>

      <div role="tablist" className="flex gap-2 border-b border-[var(--card-border)] dark:border-neutral-700/70">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "comments"}
          className={`font-brand px-3 py-2 text-fp-caption font-semibold uppercase tracking-wide transition-colors ${
            tab === "comments"
              ? "-mb-px border-b-2 border-brand-tertiary text-brand-fg dark:text-neutral-50"
              : "text-hcode-muted hover:text-brand-fg"
          }`}
          onClick={() => {
            setTab("comments");
            setCPage(1);
          }}
        >
          Comments ({vlog.engagement?.comments ?? 0})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reactions"}
          className={`font-brand px-3 py-2 text-fp-caption font-semibold uppercase tracking-wide transition-colors ${
            tab === "reactions"
              ? "-mb-px border-b-2 border-brand-tertiary text-brand-fg dark:text-neutral-50"
              : "text-hcode-muted hover:text-brand-fg"
          }`}
          onClick={() => {
            setTab("reactions");
            setVPage(1);
          }}
        >
          Likes · dislikes ({(vlog.engagement?.likes ?? 0) + (vlog.engagement?.dislikes ?? 0)})
        </button>
      </div>

      {err ? <p className="font-brand text-fp-small text-red-600 dark:text-red-400">{err}</p> : null}

      {tab === "comments" ? (
        <div className="space-y-3">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCPage(1);
              setCQ(cQInput.trim());
            }}
          >
            <input className="hcode-input max-w-xs flex-1 normal-case" placeholder="Search comments…" value={cQInput} onChange={(e) => setCQInput(e.target.value)} />
            <button type="submit" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption">
              Filter
            </button>
          </form>
          {cLoading ? (
            <p className="font-brand text-fp-small text-hcode-muted">Loading comments…</p>
          ) : cItems.length === 0 ? (
            <p className="font-brand text-fp-small text-hcode-muted">No comments for this vlog.</p>
          ) : (
            <ul className="max-h-[min(50vh,24rem)] space-y-3 overflow-y-auto pr-1">
              {cItems.map((row) =>
                editing?.id === row.id ? (
                  <li key={row.id} className="rounded-lg border border-brand-outline-soft/50 p-3 dark:border-neutral-700/70">
                    <label className="font-brand block text-fp-caption font-semibold text-brand-fg dark:text-neutral-200">
                      Author
                      <input className="hcode-input normal-case tracking-normal" value={draftAuthor} onChange={(e) => setDraftAuthor(e.target.value)} />
                    </label>
                    <label className="font-brand mt-2 block text-fp-caption font-semibold text-brand-fg dark:text-neutral-200">
                      Body
                      <textarea
                        className="mt-1 min-h-[72px] w-full rounded-lg border border-hcode-input bg-card px-3 py-2 font-brand text-fp-small normal-case dark:border-neutral-600 dark:bg-neutral-950/40"
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="hcode-btn px-3 py-2 font-brand text-fp-caption" onClick={() => void patchComment(row)}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="hcode-btn-outline px-3 py-2 font-brand text-fp-caption"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ) : (
                  <li key={row.id} className="rounded-lg border border-[var(--card-border)] p-3 dark:border-neutral-700/70">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-brand text-fp-caption font-semibold uppercase text-brand-tertiary">
                          {row.authorName?.trim() || "Anonymous"}
                        </p>
                        <p className="font-brand mt-1 whitespace-pre-wrap text-fp-small leading-relaxed text-foreground">{row.body}</p>
                        <p className="font-brand mt-2 text-fp-caption text-hcode-muted">{new Date(row.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          className="font-brand text-fp-caption font-semibold uppercase text-hcode-violet"
                          onClick={() => {
                            setEditing(row);
                            setDraftAuthor(row.authorName ?? "");
                            setDraftBody(row.body);
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="font-brand text-fp-caption uppercase text-red-600 dark:text-red-400" onClick={() => void deleteComment(row.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
          {cMeta && cMeta.totalPages > 1 ? <PaginationBar meta={cMeta} onChange={setCPage} /> : null}
        </div>
      ) : (
        <div className="space-y-3">
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setVPage(1);
              setVQ(vQInput.trim());
            }}
          >
            <input
              className="hcode-input max-w-xs flex-1 normal-case"
              placeholder="Search visitor key…"
              value={vQInput}
              onChange={(e) => setVQInput(e.target.value)}
            />
            <button type="submit" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption">
              Filter
            </button>
          </form>
          {vLoading ? (
            <p className="font-brand text-fp-small text-hcode-muted">Loading reactions…</p>
          ) : vItems.length === 0 ? (
            <p className="font-brand text-fp-small text-hcode-muted">No reactions recorded.</p>
          ) : (
            <ul className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto pr-1 font-brand text-fp-small">
              {vItems.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 dark:border-neutral-700/70">
                  <div className="min-w-0">
                    <span className={row.value === 1 ? "font-semibold text-brand-tertiary" : "font-semibold text-brand-secondary"}>
                      {row.value === 1 ? "Like" : "Dislike"}
                    </span>
                    <span className="font-brand-mono ml-2 truncate text-fp-caption text-hcode-muted" title={row.visitorKey}>
                      {row.visitorKey.length > 20 ? `${row.visitorKey.slice(0, 12)}…` : row.visitorKey}
                    </span>
                    <span className="ml-2 text-fp-caption text-hcode-muted">{new Date(row.createdAt).toLocaleString()}</span>
                  </div>
                  <button type="button" className="font-brand shrink-0 text-fp-caption uppercase text-red-600 dark:text-red-400" onClick={() => void deleteVote(row.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {vMeta && vMeta.totalPages > 1 ? <PaginationBar meta={vMeta} onChange={setVPage} /> : null}
        </div>
      )}

    </div>
  );
}

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
  const [engageVlog, setEngageVlog] = useState<VlogRow | null>(null);
  const [slug, setSlug] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [published, setPublished] = useState(false);
  const [attachRole, setAttachRole] = useState("video");
  const [attachById, setAttachById] = useState("");
  const [busyUpload, setBusyUpload] = useState(false);
  const slugSyncedFromHeadingRef = useRef(true);

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
    slugSyncedFromHeadingRef.current = true;
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
    slugSyncedFromHeadingRef.current = false;
    setEditRow(row);
    setSlug(sanitizeAdminSlug(row.slug));
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
    const descPlain = stripHtmlToPlainText(description).trim();
    const body: Record<string, unknown> = {
      slug: sanitizeAdminSlug(slug.trim()),
      heading: heading.trim(),
      description: descPlain === "" ? undefined : description.trim(),
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
      setEngageVlog(null);
      await load();
    }
  }

  const pivots = editRow?.mediaItems ?? [];

  if (!token) {
    return (
      <p className="font-brand text-fp-small text-hcode-muted">
        Sign in required.{" "}
        <a href="/admin/login" className="hcode-link">
          Login
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-brand-display text-fp-section font-bold uppercase tracking-tight text-brand-fg dark:text-neutral-50">Vlogs</h1>
          <p className="font-brand mt-1 text-fp-small leading-relaxed text-hcode-muted">
            Manage episodes, publishing, media, comments, and likes or dislikes. Click a row to review engagement in a modal.
          </p>
        </div>
        <button type="button" className="hcode-btn px-4 py-2.5 font-brand text-fp-caption" onClick={openCreate}>
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
        <input className="hcode-input max-w-xs normal-case" placeholder="Search…" value={qInput} onChange={(e) => setQInput(e.target.value)} />
        <button type="submit" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption">
          Search
        </button>
      </form>

      {err ? <p className="font-brand text-fp-small text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] dark:border-neutral-700/70">
        <table className="min-w-full border-collapse text-left font-brand text-fp-small">
          <thead className="border-b border-[var(--card-border)] bg-hcode-gray/90 dark:border-neutral-700/70 dark:bg-neutral-950/80">
            <tr>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Slug</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Heading</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Comments</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Likes</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Dislikes</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Media</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Published</th>
              <th className="text-fp-caption px-3 py-3 text-right font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-hcode-muted">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-hcode-muted">
                  No vlogs
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer border-b border-[var(--card-border)] transition-colors hover:bg-brand-surface-low/70 dark:border-neutral-800 dark:hover:bg-white/5"
                  onClick={() => setEngageVlog(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEngageVlog(row);
                    }
                  }}
                  aria-label={`Open engagement for ${row.heading}`}
                >
                  <td className="max-w-[100px] truncate px-3 py-2.5 font-brand-mono text-fp-caption">{row.slug}</td>
                  <td className="max-w-[180px] truncate px-3 py-2.5">{row.heading}</td>
                  <td className="px-3 py-2.5 tabular-nums text-foreground">{row.engagement?.comments ?? 0}</td>
                  <td className="px-3 py-2.5 tabular-nums text-foreground">{row.engagement?.likes ?? 0}</td>
                  <td className="px-3 py-2.5 tabular-nums text-foreground">{row.engagement?.dislikes ?? 0}</td>
                  <td className="px-3 py-2.5 text-hcode-muted">{row.mediaItems?.length ?? 0}</td>
                  <td className="px-3 py-2.5">{row.published ? "yes" : "no"}</td>
                  <td className="space-x-2 whitespace-nowrap px-3 py-2.5 text-right">
                    <button
                      type="button"
                      className="font-brand text-fp-caption font-semibold uppercase text-hcode-violet"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(row);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="font-brand text-fp-caption font-semibold uppercase text-red-600 dark:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteVlog(row.id);
                      }}
                    >
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
        open={engageVlog !== null}
        title={engageVlog ? `Engagement: ${engageVlog.heading}` : ""}
        onClose={() => setEngageVlog(null)}
        panelClassName="max-w-2xl"
      >
        {engageVlog && token ? (
          <EngagementModalBody key={engageVlog.id} vlog={engageVlog} token={token} onChanged={() => void load()} />
        ) : null}
      </Modal>

      <Modal
        open={modal !== null}
        title={modal === "create" ? "New vlog" : "Edit vlog"}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption" onClick={() => setModal(null)}>
              Close
            </button>
            {modal === "edit" && editRow ? (
              <button type="button" className="font-brand text-fp-caption font-semibold uppercase text-red-600 dark:text-red-400" onClick={() => void deleteVlog(editRow.id)}>
                Delete vlog
              </button>
            ) : null}
            <button type="submit" form="vlog-form" className="hcode-btn px-4 py-2.5 font-brand text-fp-caption">
              Save
            </button>
          </>
        }
      >
        <form id="vlog-form" className="space-y-3" onSubmit={saveVlog}>
          <label className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
            Heading
            <input
              className="hcode-input normal-case tracking-normal"
              value={heading}
              onChange={(e) => {
                const v = e.target.value;
                setHeading(v);
                if (slugSyncedFromHeadingRef.current) setSlug(slugifyFromHeading(v));
              }}
              required
            />
          </label>
          <label className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
            Slug
            <span className="mb-1 mt-0.5 block font-brand text-[10px] font-normal normal-case leading-snug tracking-normal text-hcode-muted">
              Auto-filled from Heading on new vlogs until you edit. Lowercase letters, digits, underscores only.
            </span>
            <input
              className="hcode-input normal-case tracking-normal"
              value={slug}
              onChange={(e) => {
                slugSyncedFromHeadingRef.current = false;
                setSlug(sanitizeAdminSlug(e.target.value));
              }}
              required
            />
          </label>
          <label className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
            Description
            <AdminRichTextEditor value={description} onChange={setDescription} />
          </label>
          <label className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
            Sort order
            <input type="number" className="hcode-input normal-case tracking-normal" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>
          <label className="font-brand flex items-center gap-2 text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
            Published
          </label>
        </form>

        {modal === "edit" && activeVlogId ? (
          <div className="mt-6 border-t border-[var(--card-border)] pt-4 dark:border-neutral-700/70">
            <h3 className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.14em] text-brand-fg dark:text-neutral-50">Media</h3>
            <p className="font-brand mt-1 text-fp-caption text-hcode-muted">Upload a file or paste an existing media ID from the Media library.</p>

            <ul className="font-brand mt-3 space-y-2 text-fp-small">
              {pivots.length === 0 ? (
                <li className="text-hcode-muted">No media attached.</li>
              ) : (
                pivots.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border border-[var(--card-border)] px-2 py-2 dark:border-neutral-700/70">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold uppercase text-hcode-violet">{p.role}</span>
                      <span className="text-hcode-muted"> · {p.mediaId.slice(0, 8)}…</span>
                      {p.media?.path ? (
                        <div className="font-brand mt-1 truncate text-fp-caption">
                          <a href={assetUrl(p.media.path)} target="_blank" rel="noreferrer" className="hcode-link">
                            {p.media.originalName || p.media.path}
                          </a>
                          <span className="text-hcode-muted"> ({p.media.mimeType})</span>
                        </div>
                      ) : null}
                      {p.media?.mimeType?.startsWith("image/") && p.media?.path ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element -- admin thumb preview */}
                          <img src={assetUrl(p.media.path)} alt="" className="mt-2 h-16 max-w-[120px] border border-[var(--card-border)] object-cover dark:border-neutral-700/70" />
                        </>
                      ) : null}
                    </div>
                    <button type="button" className="font-brand text-fp-caption uppercase text-red-600 dark:text-red-400" onClick={() => void detachPivot(p.id)}>
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-4 space-y-2">
              <label className="font-brand block text-fp-caption font-semibold uppercase tracking-wider text-brand-fg dark:text-neutral-200">
                Role for new upload / attach
                <select className="mt-1 hcode-input normal-case" value={attachRole} onChange={(e) => setAttachRole(e.target.value)}>
                  {MEDIA_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <form onSubmit={uploadAndAttach} className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--card-border)] p-3 dark:border-neutral-700/70">
                <label className="font-brand block text-fp-caption font-semibold uppercase tracking-wider">
                  Upload file
                  <input name="file" type="file" className="font-brand mt-1 block w-full text-fp-small" />
                </label>
                <button type="submit" className="hcode-btn px-3 py-2.5 font-brand text-fp-caption" disabled={busyUpload}>
                  {busyUpload ? "…" : "Upload & attach"}
                </button>
              </form>
              <div className="flex flex-wrap items-end gap-2">
                <label className="font-brand block flex-1 text-fp-caption font-semibold uppercase tracking-wider">
                  Media ID (UUID)
                  <input className="hcode-input normal-case tracking-normal" value={attachById} onChange={(e) => setAttachById(e.target.value)} placeholder="paste UUID" />
                </label>
                <button type="button" className="hcode-btn-outline px-3 py-2.5 font-brand text-fp-caption" onClick={() => void attachMedia(attachById, attachRole)}>
                  Attach
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {modal === "create" ? <p className="font-brand mt-4 text-fp-caption text-hcode-muted">Save once to enable media upload and attachments.</p> : null}
      </Modal>
    </div>
  );
}
