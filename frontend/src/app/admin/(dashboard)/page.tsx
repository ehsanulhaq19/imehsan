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
        { label: "Vlogs", value: stats.vlogs, href: "/admin/vlogs" },
        { label: "Comments", value: stats.vlogComments, href: "/admin/vlog-comments" },
        { label: "Votes", value: stats.vlogVotes, href: "/admin/vlog-votes" },
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
        <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-black dark:text-neutral-100">Overview</h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-hcode-muted">
          Signed-in system users only. Use the sidebar to manage content. Quick links match the primary entities in the API.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 transition hover:border-black dark:border-neutral-700 dark:hover:border-neutral-500"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-hcode-muted">{c.label}</p>
            <p className="mt-2 font-display text-2xl text-black dark:text-neutral-100">{c.value}</p>
          </Link>
        ))}
      </section>

      {(sessionCountRange !== null || pageHitsRange !== null) && (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-hcode-muted">
              Unique visitor-days (range)
            </p>
            <p className="mt-2 font-display text-3xl text-black dark:text-neutral-100">{sessionCountRange ?? "—"}</p>
            <p className="mt-2 text-[10px] leading-snug text-hcode-muted">
              Same visitor, same UTC day = one session. Different days count separately.
            </p>
          </div>
          <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-hcode-muted">Page views (range)</p>
            <p className="mt-2 font-display text-3xl text-black dark:text-neutral-100">{pageHitsRange ?? "—"}</p>
            <p className="mt-2 text-[10px] leading-snug text-hcode-muted">
              Each path opened counts separately (by time the page was recorded).
            </p>
          </div>
        </section>
      )}

      <section className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-black dark:text-neutral-100">
              Daily unique visitors
            </h2>
            {rangeLabel ? (
              <p className="mt-1 text-[10px] text-hcode-muted">
                {rangeLabel} · distinct visitors starting a session each UTC day
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wider">
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
            <p className="text-xs text-hcode-muted">No session data in this range.</p>
          ) : (
            daily.map((d) => {
              const h = Math.max(6, Math.round((d.count / maxDaily) * 140));
              return (
              <div key={d.date} className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full max-w-[36px] rounded-t bg-hcode-violet/90 dark:bg-hcode-violet/70"
                  style={{ height: `${h}px` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[8px] text-hcode-muted md:text-[9px]">{d.date.slice(5)}</span>
              </div>
              );
            })
          )}
        </div>
      </section>

      <section className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-black dark:text-neutral-100">
              Top paths in range
            </h2>
            <p className="mt-1 text-[10px] text-hcode-muted">
              Page views aggregated by path for the same date range as above.
            </p>
          </div>
          <Link href="/admin/sessions" className="hcode-link text-[10px] font-semibold uppercase tracking-wider">
            All visitor sessions →
          </Link>
        </div>
        {topPaths.length === 0 ? (
          <p className="mt-4 text-xs text-hcode-muted">No page views in this range.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[10px] uppercase tracking-wider text-hcode-muted dark:border-neutral-800">
                  <th className="py-2 pr-4 font-semibold">Path</th>
                  <th className="py-2 font-semibold">Views</th>
                </tr>
              </thead>
              <tbody>
                {topPaths.map((row) => (
                  <tr key={row.path} className="border-b border-[var(--card-border)] last:border-0 dark:border-neutral-800">
                    <td className="max-w-[70vw] py-2 pr-4 font-mono text-[10px] text-foreground md:max-w-xl">
                      <span className="break-all">{row.path}</span>
                    </td>
                    <td className="py-2 tabular-nums text-black dark:text-neutral-100">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700 md:p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-black dark:text-neutral-100">
            Recent vlog activity
          </h2>
          <ul className="mt-4 space-y-3 text-[11px]">
            {activity.length === 0 ? (
              <li className="text-hcode-muted">No recent comments or votes.</li>
            ) : (
              activity.map((a) => (
                <li key={`${a.kind}-${a.id}`} className="border-b border-[var(--card-border)] pb-3 last:border-0 dark:border-neutral-800">
                  <span className="font-semibold uppercase tracking-wider text-hcode-violet">
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
        <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4 dark:border-neutral-700 md:p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-black dark:text-neutral-100">
            Sections
          </h2>
          <ul className="mt-4 grid gap-2 text-[11px] sm:grid-cols-2">
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
