"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminFetch, readAdminToken, type PageMeta } from "@/lib/admin-fetch";
import { Modal } from "@/components/admin/Modal";
import { PaginationBar } from "@/components/admin/PaginationBar";

export type FieldDef =
  | {
      name: string;
      label: string;
      type: "text" | "textarea" | "number" | "email" | "url" | "date" | "time" | "password";
    }
  | { name: string; label: string; type: "checkbox" }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] };

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
    const initial: Record<string, string> = {};
    const id = String(row.id ?? "");
    setEditId(id);
    for (const f of fields) {
      const v = row[f.name];
      if (f.type === "checkbox") initial[f.name] = v ? "true" : "false";
      else if (v === null || v === undefined) initial[f.name] = "";
      else initial[f.name] = String(v);
    }
    setForm(initial);
    setModal("edit");
  }

  function buildBody(): Record<string, unknown> {
    const body: Record<string, unknown> = {};
    for (const f of fields) {
      const raw = form[f.name];
      if (f.type === "checkbox") {
        body[f.name] = raw === "true";
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
    if (v === null || v === undefined) return "—";
    if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
    return String(v);
  }

  if (!token) {
    return (
      <div className="text-sm text-hcode-muted">
        Sign in required. <a href="/admin/login" className="hcode-link">Login</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">{title}</h1>
          <p className="mt-1 text-xs text-hcode-muted">Search, create, edit, and delete records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          {allowCreate ? (
            <button type="button" className="hcode-btn px-4 py-2 text-[10px]" onClick={openCreate}>
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
        <button type="submit" className="hcode-btn-outline px-4 py-2 text-[10px]">
          Search
        </button>
      </form>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="overflow-x-auto border border-[var(--card-border)] bg-[var(--card-bg)] dark:border-neutral-700">
        <table className="min-w-full border-collapse text-left text-[11px]">
          <thead className="border-b border-[var(--card-border)] bg-hcode-gray/80 dark:border-neutral-700 dark:bg-neutral-900">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-3 py-2 font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
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
                    <td key={c.key} className="max-w-[220px] truncate px-3 py-2 text-foreground">
                      {cell(row, c.key)}
                    </td>
                  ))}
                  <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                    {allowEdit ? (
                      <button type="button" className="text-[10px] font-semibold uppercase text-hcode-violet" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                    ) : null}
                    {allowDelete ? (
                      <button
                        type="button"
                        className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400"
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
            <button type="button" className="hcode-btn-outline px-4 py-2 text-[10px]" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button type="submit" form="crud-form" className="hcode-btn px-4 py-2 text-[10px]">
              Save
            </button>
          </>
        }
      >
        <form id="crud-form" className="space-y-3" onSubmit={onSubmit}>
          {fields.map((f) =>
            f.type === "checkbox" ? (
              <label key={f.name} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={form[f.name] === "true"}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked ? "true" : "false" }))}
                  className="h-4 w-4"
                />
                {f.label}
              </label>
            ) : f.type === "textarea" ? (
              <label key={f.name} className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
                {f.label}
                <textarea
                  className="mt-1 min-h-[88px] w-full border border-hcode-input bg-white px-3 py-2 text-[11px] normal-case dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              </label>
            ) : f.type === "select" ? (
              <label key={f.name} className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
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
            ) : (
              <label key={f.name} className="block text-[11px] font-semibold uppercase tracking-wider text-black dark:text-neutral-200">
                {f.label}
                <input
                  type={f.type === "number" ? "number" : f.type}
                  className="hcode-input normal-case tracking-normal"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              </label>
            ),
          )}
        </form>
      </Modal>
    </div>
  );
}
