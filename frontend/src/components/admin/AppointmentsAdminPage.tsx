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

type AttachmentPivot = {
  id: string;
  mediaId: string;
  media?: MediaRef | null;
};

type AppointmentRow = {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  timezone?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  reason?: string | null;
  status: string;
  createdAt?: string;
  attachments?: AttachmentPivot[];
};

const EDIT_FIELDS = [
  { name: "appointmentDate", label: "Date (YYYY-MM-DD)", type: "date" as const },
  { name: "appointmentTime", label: "Time (HH:MM)", type: "time" as const },
  { name: "timezone", label: "Timezone (IANA)", type: "text" as const },
  { name: "contactName", label: "Contact name", type: "text" as const },
  { name: "contactEmail", label: "Contact email", type: "email" as const },
  { name: "contactPhone", label: "Phone", type: "text" as const },
  { name: "reason", label: "Reason", type: "textarea" as const },
  { name: "status", label: "Status", type: "text" as const },
];

function AttachmentPreview({
  appointmentId,
  attachment,
  token,
}: {
  appointmentId: string;
  attachment: AttachmentPivot;
  token: string;
}) {
  const media = attachment.media;
  if (!media?.path) return null;
  const src = assetUrl(media.path);
  const name = media.originalName || media.path.split("/").pop() || "file";
  const isImage = media.mimeType.startsWith("image/");
  const isPdf = media.mimeType === "application/pdf";

  async function download() {
    const res = await adminFetch(
      `/admin/appointments/${appointmentId}/attachments/${attachment.mediaId}/download`,
      token,
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <li className="rounded-lg border border-[var(--card-border)] p-3 dark:border-neutral-700/70">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-brand text-fp-small font-semibold text-foreground">{name}</p>
          <p className="font-brand text-fp-caption text-hcode-muted">{media.mimeType}</p>
        </div>
        <button
          type="button"
          className="hcode-btn-outline shrink-0 px-3 py-2 font-brand text-fp-caption"
          onClick={() => void download()}
        >
          Download
        </button>
      </div>
      {isImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin attachment preview */}
          <img src={src} alt="" className="mt-3 max-h-48 w-full border border-[var(--card-border)] object-contain dark:border-neutral-700/70" />
        </>
      ) : isPdf ? (
        <iframe src={src} title={name} className="mt-3 h-56 w-full border border-[var(--card-border)] dark:border-neutral-700/70" />
      ) : (
        <p className="mt-3 font-brand text-fp-caption text-hcode-muted">Preview not available for this file type.</p>
      )}
    </li>
  );
}

function DetailBody({ row }: { row: AppointmentRow }) {
  const attachments = row.attachments ?? [];
  const token = readAdminToken();

  return (
    <dl className="space-y-3 font-brand text-fp-small">
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Date</dt>
        <dd className="text-foreground">{row.appointmentDate}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Time</dt>
        <dd className="text-foreground">{row.appointmentTime}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Timezone</dt>
        <dd className="text-foreground">{row.timezone || "UTC"}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Contact</dt>
        <dd className="text-foreground">{row.contactName}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Email</dt>
        <dd className="text-foreground">{row.contactEmail}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Phone</dt>
        <dd className="text-foreground">{row.contactPhone?.trim() || "—"}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Status</dt>
        <dd className="text-foreground">{row.status}</dd>
      </div>
      <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
        <dt className="font-semibold uppercase text-hcode-muted">Reason</dt>
        <dd className="whitespace-pre-wrap text-foreground">{row.reason?.trim() || "—"}</dd>
      </div>
      {row.createdAt ? (
        <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2">
          <dt className="font-semibold uppercase text-hcode-muted">Created</dt>
          <dd className="text-foreground">{new Date(row.createdAt).toLocaleString()}</dd>
        </div>
      ) : null}
      <div className="pt-2">
        <p className="font-semibold uppercase text-hcode-muted">Attachments</p>
        {attachments.length === 0 ? (
          <p className="mt-2 text-hcode-muted">No attachments.</p>
        ) : token ? (
          <ul className="mt-3 space-y-3">
            {attachments.map((a) => (
              <AttachmentPreview key={a.id} appointmentId={row.id} attachment={a} token={token} />
            ))}
          </ul>
        ) : null}
      </div>
    </dl>
  );
}

export function AppointmentsAdminPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [items, setItems] = useState<AppointmentRow[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<AppointmentRow | null>(null);
  const [editRow, setEditRow] = useState<AppointmentRow | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErr(null);
    const qs = new URLSearchParams({ page: String(page), limit: "15", q });
    const res = await adminFetch(`/admin/appointments?${qs}`, token);
    if (!res.ok) {
      setErr(`Load failed (${res.status})`);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { items: AppointmentRow[]; meta: PageMeta };
    setItems(data.items ?? []);
    setMeta(data.meta ?? null);
    setLoading(false);
  }, [token, page, q]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(row: AppointmentRow) {
    const initial: Record<string, string> = {};
    for (const f of EDIT_FIELDS) {
      const v = row[f.name as keyof AppointmentRow];
      initial[f.name] = v === null || v === undefined ? "" : String(v);
    }
    setForm(initial);
    setEditRow(row);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!token || !editRow) return;
    const body: Record<string, string> = {};
    for (const f of EDIT_FIELDS) {
      const v = form[f.name]?.trim() ?? "";
      if (v !== "") body[f.name] = v;
    }
    const res = await adminFetch(`/admin/appointments/${editRow.id}`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!res.ok) setErr(`Update failed (${res.status})`);
    else {
      setEditRow(null);
      await load();
    }
  }

  async function deleteRow(id: string) {
    if (!token || !confirm("Delete this appointment?")) return;
    const res = await adminFetch(`/admin/appointments/${id}`, token, { method: "DELETE" });
    if (!res.ok) setErr(`Delete failed (${res.status})`);
    else {
      setDetailRow(null);
      await load();
    }
  }

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
      <div>
        <h1 className="font-brand-display text-fp-section font-bold uppercase tracking-tight text-brand-fg dark:text-neutral-50">Appointments</h1>
        <p className="font-brand mt-1 text-fp-small text-hcode-muted">Click a row to view full details and attachments.</p>
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
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Contact</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Email</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Date</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Time</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Timezone</th>
              <th className="text-fp-caption px-3 py-3 font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Status</th>
              <th className="text-fp-caption px-3 py-3 text-right font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-hcode-muted">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-hcode-muted">
                  No appointments
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer border-b border-[var(--card-border)] transition-colors hover:bg-brand-surface-low/70 dark:border-neutral-800 dark:hover:bg-white/5"
                  onClick={() => setDetailRow(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailRow(row);
                    }
                  }}
                >
                  <td className="max-w-[140px] truncate px-3 py-2.5">{row.contactName}</td>
                  <td className="max-w-[180px] truncate px-3 py-2.5">{row.contactEmail}</td>
                  <td className="px-3 py-2.5">{row.appointmentDate}</td>
                  <td className="px-3 py-2.5">{row.appointmentTime}</td>
                  <td className="max-w-[120px] truncate px-3 py-2.5">{row.timezone || "UTC"}</td>
                  <td className="px-3 py-2.5">{row.status}</td>
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
                        void deleteRow(row.id);
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

      <Modal open={detailRow !== null} title={detailRow ? `Appointment: ${detailRow.contactName}` : ""} onClose={() => setDetailRow(null)} panelClassName="max-w-2xl">
        {detailRow ? <DetailBody row={detailRow} /> : null}
      </Modal>

      <Modal
        open={editRow !== null}
        title="Edit appointment"
        onClose={() => setEditRow(null)}
        footer={
          <>
            <button type="button" className="hcode-btn-outline px-4 py-2.5 font-brand text-fp-caption" onClick={() => setEditRow(null)}>
              Cancel
            </button>
            <button type="submit" form="appointment-edit-form" className="hcode-btn px-4 py-2.5 font-brand text-fp-caption">
              Save
            </button>
          </>
        }
      >
        <form id="appointment-edit-form" className="space-y-3" onSubmit={saveEdit}>
          {EDIT_FIELDS.map((f) =>
            f.type === "textarea" ? (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                <textarea
                  className="mt-1 min-h-[88px] w-full rounded-lg border border-hcode-input bg-card px-3 py-2 font-brand text-fp-small normal-case text-foreground outline-none dark:border-neutral-600 dark:bg-neutral-950/50"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              </label>
            ) : (
              <label key={f.name} className="font-brand block text-fp-caption font-semibold uppercase tracking-[0.08em] text-brand-fg dark:text-neutral-50">
                {f.label}
                <input
                  type={f.type}
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
