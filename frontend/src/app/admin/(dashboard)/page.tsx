"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_NAV } from "@/components/admin/AdminDashboardShell";
import { adminFetch, readAdminToken } from "@/lib/admin-fetch";

type Stats = {
  projects: number;
  caseStudies: number;
  vlogs: number;
  appointments: number;
  certifications: number;
  testimonials: number;
  gitRepos: number;
  socialLinks: number;
  media: number;
  conversations: number;
  users: number;
  emailConfigs: number;
  aiConfigs: number;
  vlogComments: number;
  vlogVotes: number;
  sessionsTotal: number;
};

type ActivityRow =
  | {
      kind: "comment";
      at: string;
      id: string;
      vlogSlug: string;
      vlogHeading: string;
      authorName: string | null;
      body: string;
    }
  | {
      kind: "vote";
      at: string;
      id: string;
      vlogSlug: string;
      vlogHeading: string;
      value: number;
      visitorKey: string;
    };

export default function AdminOverviewPage() {
  const token = useMemo(() => readAdminToken(), []);
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<{ date: string; count: number }[]>([]);
  const [rangeLabel, setRangeLabel] = useState("");
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [sessionCountRange, setSessionCountRange] = useState<number | null>(null);
  const [pageHitsRange, setPageHitsRange] = useState<number | null>(null);
  const [topPaths, setTopPaths] = useState<{ path: string; count: number }[]>([]);
  const [from, setFrom] = useState(() => {
    const t = new Date();
    t.setUTCDate(t.getUTCDate() - 13);
    return t.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!token) return;
    void (async () => {
      const sRes = await adminFetch("/admin/dashboard/stats", token);
      if (sRes.ok) setStats((await sRes.json()) as Stats);

      const qs = new URLSearchParams({ from, to });
      const aRes = await adminFetch(`/admin/analytics/sessions?${qs}`, token);
      if (aRes.ok) {
        const j = (await aRes.json()) as {
          dailySessions: { date: string; count: number }[];
          range?: { from?: string; to?: string };
          sessionCount?: number;
          pageHits?: number;
          topPaths?: { path: string; count: number }[];
        };
        setDaily(j.dailySessions ?? []);
        setSessionCountRange(typeof j.sessionCount === "number" ? j.sessionCount : null);
        setPageHitsRange(typeof j.pageHits === "number" ? j.pageHits : null);
        setTopPaths(Array.isArray(j.topPaths) ? j.topPaths : []);
        if (j.range?.from && j.range?.to) setRangeLabel(`${j.range.from} → ${j.range.to}`);
      }

      const acRes = await adminFetch("/admin/vlogs/activity?limit=25", token);
      if (acRes.ok) {
        const raw = (await acRes.json()) as unknown;
        const rows = Array.isArray(raw) ? raw : [];
        setActivity(
          rows.map((r) => {
            const o = r as Record<string, unknown>;
            const at =
              typeof o.at === "string"
                ? o.at
                : o.at instanceof Date
                  ? o.at.toISOString()
                  : String(o.at ?? "");
            if (o.kind === "comment") {
              return {
                kind: "comment" as const,
                at,
                id: String(o.id ?? ""),
                vlogSlug: String(o.vlogSlug ?? ""),
                vlogHeading: String(o.vlogHeading ?? ""),
                authorName: (o.authorName as string | null) ?? null,
                body: String(o.body ?? ""),
              };
            }
            return {
              kind: "vote" as const,
              at,
              id: String(o.id ?? ""),
              vlogSlug: String(o.vlogSlug ?? ""),
              vlogHeading: String(o.vlogHeading ?? ""),
              value: Number(o.value ?? 0),
              visitorKey: String(o.visitorKey ?? ""),
            };
          }),
        );
      }
    })();
  }, [token, from, to]);

  const maxDaily = useMemo(() => Math.max(1, ...daily.map((d) => d.count)), [daily]);

  const cards: { label: string; value: number; href: string }[] = stats
    ? [
        { label: "Projects", value: stats.projects, href: "/admin/projects" },
        { label: "Case studies", value: stats.caseStudies, href: "/admin/case-studies" },
        { label: "Vlogs & engagement", value: stats.vlogs, href: "/admin/vlogs" },
        {
          label: "Comment rows",
          value: stats.vlogComments,
          href: "/admin/vlogs",
        },
        {
          label: "Reaction rows",
          value: stats.vlogVotes,
          href: "/admin/vlogs",
        },
        { label: "Certifications", value: stats.certifications, href: "/admin/certifications" },
        { label: "Testimonials", value: stats.testimonials, href: "/admin/testimonials" },
        { label: "Repositories", value: stats.gitRepos, href: "/admin/git-repos" },
        { label: "Social links", value: stats.socialLinks, href: "/admin/social-links" },
        { label: "Appointments", value: stats.appointments, href: "/admin/appointments" },
        { label: "Media files", value: stats.media, href: "/admin/media" },
        { label: "Conversations", value: stats.conversations, href: "/admin/conversations" },
        { label: "Users", value: stats.users, href: "/admin" },
        { label: "Visitor sessions (all time)", value: stats.sessionsTotal, href: "/admin/sessions" },
        { label: "Email configs", value: stats.emailConfigs, href: "/admin/email-config" },
        { label: "AI configs", value: stats.aiConfigs, href: "/admin/ai-config" },
      ]
    : [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-brand-display text-fp-section font-bold uppercase tracking-tight text-brand-fg dark:text-neutral-50">Overview</h1>
        <p className="font-brand mt-2 max-w-2xl text-fp-small leading-relaxed text-hcode-muted">
          Signed-in system users only. Use the sidebar to manage content. Quick links match the primary entities in the API.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 transition-colors hover:border-brand-tertiary/55 dark:border-neutral-700/70 dark:hover:border-brand-tertiary/50"
          >
            <p className="font-brand text-fp-caption font-semibold uppercase tracking-[0.12em] text-hcode-muted">{c.label}</p>
            <p className="font-brand-display mt-2 text-fp-sub font-bold text-brand-fg dark:text-neutral-50">{c.value}</p>
          </Link>
        ))}
      </section>

      {(sessionCountRange !== null || pageHitsRange !== null) && (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70">
            <p className="font-brand text-fp-caption font-semibold uppercase tracking-[0.12em] text-hcode-muted">
              Unique visitor-days (range)
            </p>
            <p className="font-brand-display mt-2 text-fp-section font-bold text-brand-fg dark:text-neutral-50">
              {sessionCountRange ?? "-"}
            </p>
            <p className="font-brand mt-2 text-fp-caption leading-snug text-hcode-muted">
              Same visitor, same UTC day = one session. Different days count separately.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70">
            <p className="font-brand text-fp-caption font-semibold uppercase tracking-[0.12em] text-hcode-muted">Page views (range)</p>
            <p className="font-brand-display mt-2 text-fp-section font-bold text-brand-fg dark:text-neutral-50">
              {pageHitsRange ?? "-"}
            </p>
            <p className="font-brand mt-2 text-fp-caption leading-snug text-hcode-muted">
              Each path opened counts separately (by time the page was recorded).
            </p>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.14em] text-brand-fg dark:text-neutral-50">
              Daily unique visitors
            </h2>
            {rangeLabel ? (
              <p className="font-brand mt-1 text-fp-caption text-hcode-muted">
                {rangeLabel} · distinct visitors starting a session each UTC day
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 font-brand text-fp-caption font-semibold uppercase tracking-wider">
            <label className="flex flex-col gap-1">
              From
              <input type="date" className="hcode-input normal-case" value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              To
              <input type="date" className="hcode-input normal-case" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        </div>
        <div className="mt-8 flex h-44 items-end gap-1 overflow-x-auto pb-2">
          {daily.length === 0 ? (
            <p className="font-brand text-fp-small text-hcode-muted">No session data in this range.</p>
          ) : (
            daily.map((d) => {
              const h = Math.max(6, Math.round((d.count / maxDaily) * 140));
              return (
              <div key={d.date} className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full max-w-[36px] rounded-t bg-brand-tertiary/90 shadow-sm dark:bg-brand-tertiary/75"
                  style={{ height: `${h}px` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="font-brand-mono text-fp-caption text-hcode-muted">{d.date.slice(5)}</span>
              </div>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.14em] text-brand-fg dark:text-neutral-50">
              Top paths in range
            </h2>
            <p className="font-brand mt-1 text-fp-caption text-hcode-muted">
              Page views aggregated by path for the same date range as above.
            </p>
          </div>
          <Link href="/admin/sessions" className="hcode-link font-brand text-fp-caption font-semibold uppercase tracking-wider">
            All visitor sessions →
          </Link>
        </div>
        {topPaths.length === 0 ? (
          <p className="font-brand mt-4 text-fp-small text-hcode-muted">No page views in this range.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left font-brand text-fp-small">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-fp-caption uppercase tracking-wider text-hcode-muted dark:border-neutral-800">
                  <th className="py-2 pr-4 font-semibold">Path</th>
                  <th className="py-2 font-semibold">Views</th>
                </tr>
              </thead>
              <tbody>
                {topPaths.map((row) => (
                  <tr key={row.path} className="border-b border-[var(--card-border)] last:border-0 dark:border-neutral-800">
                    <td className="max-w-[70vw] py-2 pr-4 font-brand-mono text-fp-caption text-foreground md:max-w-xl">
                      <span className="break-all">{row.path}</span>
                    </td>
                    <td className="py-2 font-brand-display tabular-nums text-fp-body font-semibold text-brand-fg dark:text-neutral-50">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70 md:p-6">
          <h2 className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.14em] text-brand-fg dark:text-neutral-50">
            Recent vlog activity
          </h2>
          <ul className="font-brand mt-4 space-y-3 text-fp-small">
            {activity.length === 0 ? (
              <li className="text-hcode-muted">No recent comments or votes.</li>
            ) : (
              activity.map((a) => (
                <li key={`${a.kind}-${a.id}`} className="border-b border-[var(--card-border)] pb-3 last:border-0 dark:border-neutral-800">
                  <span className="font-semibold uppercase tracking-wide text-brand-tertiary">
                    {a.kind === "comment" ? "Comment" : a.value === 1 ? "Like" : "Dislike"}
                  </span>
                  <span className="text-hcode-muted"> · {new Date(a.at).toLocaleString()}</span>
                  <p className="mt-1 text-foreground">
                    <Link href={`/vlogs/${a.vlogSlug}`} className="hcode-link">
                      {a.vlogHeading || a.vlogSlug}
                    </Link>
                  </p>
                  {a.kind === "comment" ? (
                    <p className="mt-1 line-clamp-3 text-hcode-muted">{a.body}</p>
                  ) : (
                    <p className="mt-1 text-hcode-muted">Visitor …{a.visitorKey.slice(-6)}</p>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700/70 md:p-6">
          <h2 className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.14em] text-brand-fg dark:text-neutral-50">
            Sections
          </h2>
          <ul className="font-brand mt-4 grid gap-2 text-fp-small sm:grid-cols-2">
            {ADMIN_NAV.filter((n) => n.href !== "/admin").map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hcode-link font-semibold uppercase tracking-wider">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
