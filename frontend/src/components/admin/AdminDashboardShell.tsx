"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/vlogs", label: "Vlogs" },
  { href: "/admin/vlog-comments", label: "Vlog comments" },
  { href: "/admin/vlog-votes", label: "Vlog votes" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/git-repos", label: "Repositories" },
  { href: "/admin/social-links", label: "Social links" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/email-config", label: "Email config" },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/ai-config", label: "AI widget" },
];

export function AdminDashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const userEmail = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      const raw = sessionStorage.getItem("admin_user");
      if (!raw) return "";
      const u = JSON.parse(raw) as { email?: string };
      return u.email ?? "";
    } catch {
      return "";
    }
  }, [ready]);

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token");
    if (!t) router.replace("/admin/login");
    else setReady(true);
  }, [router]);

  function signOut() {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    router.push("/admin/login");
  }

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  const navLinks = (
    <>
      {ADMIN_NAV.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              active ? "bg-black text-white dark:bg-neutral-100 dark:text-black" : "text-foreground hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            onClick={() => setDrawer(false)}
          >
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--admin-sidebar)] dark:border-neutral-800 md:flex">
        <div className="border-b border-[var(--card-border)] px-4 py-4 dark:border-neutral-800">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-black dark:text-neutral-100">Dashboard</p>
          {userEmail ? <p className="mt-2 truncate text-[10px] text-hcode-muted">{userEmail}</p> : null}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{navLinks}</nav>
        <div className="space-y-2 border-t border-[var(--card-border)] p-3 dark:border-neutral-800">
          <ThemeToggle className="w-full" />
          <button type="button" className="hcode-btn-outline w-full py-2 text-[10px]" onClick={signOut}>
            Sign out
          </button>
          <Link href="/" className="block text-center text-[10px] font-semibold uppercase tracking-wider text-hcode-violet">
            Site home
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 dark:border-neutral-800 md:hidden">
          <button type="button" className="hcode-btn-outline px-3 py-2 text-[10px]" onClick={() => setDrawer(true)}>
            Menu
          </button>
          <ThemeToggle />
        </header>

        {drawer ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setDrawer(false)} />
            <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-[var(--admin-sidebar)] shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3 dark:border-neutral-800">
                <span className="font-display text-xs uppercase tracking-[0.15em]">Menu</span>
                <button type="button" className="text-[10px] uppercase text-hcode-muted" onClick={() => setDrawer(false)}>
                  Close
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{navLinks}</nav>
              <div className="border-t border-[var(--card-border)] p-3 dark:border-neutral-800">
                <button type="button" className="hcode-btn-outline mb-2 w-full py-2 text-[10px]" onClick={signOut}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-auto px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
