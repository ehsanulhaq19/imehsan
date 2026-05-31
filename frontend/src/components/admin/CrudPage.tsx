"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { stripHtmlToPlainText } from "@/lib/html-plain";
import { sanitizeAdminSlug, slugifyFromHeading } from "@/lib/admin-slug";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
import { Modal } from "@/components/admin/Modal";
import { PaginationBar } from "@/components/admin/PaginationBar";
import { assetUrl } from "@/api/client";

export type FieldDef =
  | {
      name: string;
      label: string;
      type: "text" | "textarea" | "richtext" | "number" | "email" | "url" | "date" | "time" | "password";
    }
  | { name: string; label: string; type: "checkbox" }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "image-upload" };

export type CrudPageProps = {
  title: string;
  resourcePath: string;
  columns: { key: string; label: string }[];
  fields: FieldDef[];
  allowCreate?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
  extraActions?: ReactNode;
};

export function CrudPage({
  title,
  resourcePath,
  columns,
  fields,
  allowCreate = true,
  allowDelete = true,
  allowEdit = true,
  extraActions,
}: CrudPageProps) {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const slugSyncedFromHeadingRef = useRef(false);

  const slugSourceField = useMemo(() => {
    const hasSlug = fields.some((f) => f.name === "slug");
    if (!hasSlug) return null;
    const src = fields.find((f) => f.name === "heading" || f.name === "title");
    return src?.name ?? null;
  }, [fields]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    const qs = new URLSearchParams({ page: String(page), limit: "15", q });
    const res = await adminFetch(`${resourcePath}?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: Record<string, unknown>[]; meta: PageMeta };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setLoading(false);
  }, [token, resourcePath, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    slugSyncedFromHeadingRef.current = true;
    const initial: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === "checkbox") initial[f.name] = "false";
      else if (f.type === "select") initial[f.name] = f.options[0]?.value ?? "";
      else initial[f.name] = "";
    }
    setForm(initial);
    setEditId(null);
    setModal("create");
  }

  function openEdit(row: Record<string, unknown>) {
    slugSyncedFromHeadingRef.current = false;
    const initial: Record<string, string> = {};
    const id = String(row.id ?? "");
    setEditId(id);
    for (const f of fields) {
      const v = row[f.name];
      if (f.type === "checkbox") initial[f.name] = v ? "true" : "false";
      else if (v === null || v === undefined) initial[f.name] = "";
      else initial[f.name] = f.name === "slug" ? sanitizeAdminSlug(String(v)) : String(v);
    }
    setForm(initial);
    setModal("edit");
  }

  function patchPlainField(name: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (slugSourceField !== null && name === slugSourceField && slugSyncedFromHeadingRef.current) {
        next.slug = slugifyFromHeading(value);
      }
      return next;
    });
  }

  function buildBody(): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.name];
      if (f.type === "checkbox") {
        body[f.name] = raw === "true";
        continue;
      }
      if (f.type === "richtext") {
        if (stripHtmlToPlainText(raw).trim() === "") continue;
        body[f.name] = raw;
        continue;
      }
      if (f.type === "image-upload") {
        body[f.name] = raw.trim() === "" ? null : raw;
        continue;
      }
      if (f.type === "number") {
        if (raw.trim() === "") continue;
        const n = Number(raw);
        if (!Number.isNaN(n)) body[f.name] = n;
        continue;
      }
      if (raw.trim() === "") continue;
      body[f.name] = raw;
    }
    const hasSlugField = fields.some((fld) => fld.name === "slug");
    if (hasSlugField && typeof body.slug === "string") {
      const s = sanitizeAdminSlug(body.slug);
      if (s === "") delete body.slug;
      else body.slug = s;
    }
    return body;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const body = buildBody();
    if (modal === "create") {
      const res = await adminFetch(resourcePath, token, { method: "POST", body: JSON.stringify(body) });
      if (!res.ok) setErr(`Create failed (${res.status})`);
      else {
        setModal(null);
        await load();
      }
      return;
    }
    if (modal === "edit" && editId) {
      const res = await adminFetch(`${resourcePath}/${editId}`, token, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) setErr(`Update failed (${res.status})`);
      else {
        setModal(null);
        await load();
      }
    }
  }

  async function onDelete(id: string) {
    if (!token || !confirm("Delete this row?")) return;
    const res = await adminFetch(`${resourcePath}/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else await load();
  }

  function pick(row: Record<string, unknown>, key: string): unknown {
    const parts = key.split(".");
    let cur: unknown = row;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as object)) {
        cur = (cur as Record<string, unknown>)[p];
      } else return undefined;
    }
    return cur;
  }

  function cell(row: Record<string, unknown>, key: string) {
    const v = pick(row, key);
    if (v === null || v === undefined) return "-";
    if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
    return String(v);
  }

  if (!token) {
    return (
      <div className="text-fp-small text-hcode-muted">
        Sign in required. <a href="/admin/login" className="hcode-link">Login</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-brand-display text-fp-section font-bold uppercase tracking-tight text-brand-fg dark:text-neutral-50">{title}</h1>
          <p className="font-brand mt-1 text-fp-small text-hcode-muted">Search, create, edit, and delete records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          {allowCreate ? (
            <button type="button" className="hcode-btn px-4 py-2.5 font-brand text-fp-caption" onClick={openCreate}>
              New
            </button>
          ) : null}
        </div>
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
        <button type="submit" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption">
          Search
        </button>
      </form>

      {err ? <p className="text-fp-small text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] dark:border-neutral-700/70">
        <table className="min-w-full border-collapse text-left font-brand text-fp-small">
          <thead className="border-b border-[var(--card-border)] bg-hcode-gray/90 dark:border-neutral-700/70 dark:bg-neutral-950/80">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-fp-caption whitespace-nowrap px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                  {c.label}
                </th>
              ))}
              <th className="text-fp-caption px-3 py-3 text-right font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-hcode-muted">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-hcode-muted">
                  No rows
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={String(row.id)} className="border-b border-[var(--card-border)] dark:border-neutral-800">
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-[220px] truncate px-3 py-2.5 font-brand text-fp-small text-foreground">
                      {cell(row, c.key)}
                    </td>
                  ))}
                  <td className="space-x-2 whitespace-nowrap px-3 py-2.5 text-right">
                    {allowEdit ? (
                      <button type="button" className="font-brand text-fp-caption font-semibold uppercase text-hcode-violet" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                    ) : null}
                    {allowDelete ? (
                      <button
                        type="button"
                        className="font-brand text-fp-caption font-semibold uppercase text-red-600 dark:text-red-400"
                        onClick={() => void onDelete(String(row.id))}
                      >
                        Delete
                      </button>
                    ) : null}
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
        title={modal === "create" ? `New ${title}` : `Edit ${title}`}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" form="crud-form" className="hcode-btn px-4 py-2.5 font-brand text-fp-caption">
              Save
            </button>
          </>
        }
      >
        <form id="crud-form" className="space-y-3" onSubmit={onSubmit}>
          {fields.map((f) =>
            f.type === "checkbox" ? (
              <label key={f.name} className="font-brand flex items-center gap-2 text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                <input
                  type="checkbox"
                  checked={form[f.name] === "true"}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked ? "true" : "false" }))}
                  className="h-4 w-4"
                />
                {f.label}
              </label>
            ) : f.type === "textarea" ? (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                <textarea
                  className="mt-1 min-h-[88px] w-full rounded-lg border border-hcode-input bg-card px-3 py-2 font-brand text-fp-small normal-case text-foreground outline-none transition-colors focus:border-brand-tertiary focus:ring-2 focus:ring-brand-tertiary/20 dark:border-neutral-600 dark:bg-neutral-950/50"
                  value={form[f.name] ?? ""}
                  onChange={(e) =>
                    slugSourceField !== null && f.name === slugSourceField
                      ? patchPlainField(f.name, e.target.value)
                      : setForm((s) => ({ ...s, [f.name]: e.target.value }))
                  }
                />
              </label>
            ) : f.type === "richtext" ? (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                <AdminRichTextEditor value={form[f.name] ?? ""} onChange={(html) => setForm((s) => ({ ...s, [f.name]: html }))} />
              </label>
            ) : f.type === "select" ? (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                <select
                  className="hcode-input normal-case"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : f.type === "image-upload" ? (
              <CrudImageUpload
                key={f.name}
                label={f.label}
                path={form[f.name] ?? ""}
                token={token}
                onPath={(next) => setForm((s) => ({ ...s, [f.name]: next }))}
                setErr={setErr}
              />
            ) : (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                {slugSourceField !== null && f.name === "slug" ? (
                  <span className="mb-1 mt-0.5 block font-brand text-[10px] font-normal normal-case leading-snug tracking-normal text-hcode-muted">
                    Auto-filled from {slugSourceField === "heading" ? "Heading" : "Title"} until you edit this field. Use lowercase letters,
                    digits, and underscores only.
                  </span>
                ) : null}
                <input
                  type={f.type === "number" ? "number" : f.type}
                  className="hcode-input normal-case tracking-normal"
                  value={form[f.name] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (f.name === "slug") {
                      slugSyncedFromHeadingRef.current = false;
                      setForm((s) => ({ ...s, slug: sanitizeAdminSlug(v) }));
                      return;
                    }
                    if (slugSourceField !== null && f.name === slugSourceField) {
                      patchPlainField(f.name, v);
                      return;
                    }
                    setForm((s) => ({ ...s, [f.name]: v }));
                  }}
                />
              </label>
            ),
          )}
        </form>
      </Modal>
    </div>
  );
}

function CrudImageUpload(props: {
  label: string;
  path: string;
  token: string;
  onPath: (p: string) => void;
  setErr: (e: string | null) => void;
}) {
  const { label, path, token, onPath, setErr } = props;
  const [busy, setBusy] = useState(false);
  const preview = path?.trim();

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await adminFetch("/admin/media/upload", token, { method: "POST", body: fd });
    setBusy(false);
    e.target.value = "";
    if (!res.ok) {
      setErr(`Upload failed (${res.status})`);
      return;
    }
    const raw = await res.json();
    const url = typeof raw?.url === "string" ? raw.url : "";
    if (url) onPath(url);
  }

  return (
    <div className="font-brand text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
      <p>{label}</p>
      {preview ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-hcode-input dark:border-neutral-600">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin arbitrary upload preview */}
          <img src={assetUrl(preview)} alt="" className="max-h-40 w-full object-cover" />
          <button
            type="button"
            className="w-full border-t border-[var(--card-border)] bg-hcode-gray/70 px-2 py-2 font-brand text-[10px] font-semibold normal-case text-foreground hover:bg-hcode-gray"
            onClick={() => onPath("")}
          >
            Remove image
          </button>
        </div>
      ) : null}
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        className="mt-2 block w-full font-brand text-fp-small normal-case text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-brand-tertiary/20 file:px-3 file:py-2 file:font-semibold file:text-brand-fg"
        onChange={(ev) => void onFile(ev)}
      />
    </div>
  );
}
