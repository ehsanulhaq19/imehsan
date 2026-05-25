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
  { href: "/admin/vlogs", label: "Vlogs & engagement" },
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
  }, []);

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
    return <div className="min-h-screen bg-background antialiased" />;
  }

  const navLinks = (
    <>
      {ADMIN_NAV.map(({ href, label }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded-lg px-3 py-2.5 font-brand text-fp-nav font-semibold uppercase tracking-wide transition-colors ${
              active
                ? "bg-brand-fg text-white shadow-sm dark:bg-brand-tertiary dark:text-white"
                : "text-brand-secondary hover:bg-brand-white dark:text-neutral-300 dark:hover:bg-white/10"
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
    <div className="flex min-h-screen bg-background font-brand text-fp-body text-foreground antialiased">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--admin-sidebar)] backdrop-blur-sm md:flex dark:border-neutral-700/70">
        <div className="border-b border-[var(--card-border)] px-4 py-4 dark:border-neutral-700/70">
          <p className="font-brand-mono text-fp-tag font-semibold uppercase tracking-[0.2em] text-brand-fg dark:text-neutral-50">Dashboard</p>
          {userEmail ? <p className="mt-2 truncate font-brand text-fp-caption text-hcode-muted">{userEmail}</p> : null}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">{navLinks}</nav>
        <div className="space-y-2 border-t border-[var(--card-border)] p-3 dark:border-neutral-700/70">
          <ThemeToggle className="w-full" />
          <button type="button" className="hcode-btn-outline w-full py-2.5 font-brand text-fp-caption" onClick={signOut}>
            Sign out
          </button>
          <Link
            href="/"
            className="block text-center font-brand text-fp-caption font-semibold uppercase tracking-wider text-brand-tertiary transition-colors hover:text-brand-fg dark:hover:text-cyan-200"
          >
            Site home
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 md:hidden dark:border-neutral-700/70">
          <button type="button" className="hcode-btn-outline px-4 py-2 font-brand text-fp-caption" onClick={() => setDrawer(true)}>
            Menu
          </button>
          <ThemeToggle />
        </header>

        {drawer ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-brand-fg/40 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setDrawer(false)} />
            <div className="site-drawer-panel absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-[var(--admin-sidebar)] shadow-xl dark:bg-[var(--admin-sidebar)]">
              <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3 dark:border-neutral-700/70">
                <span className="font-brand-mono text-fp-caption font-semibold uppercase tracking-[0.12em] text-brand-fg dark:text-neutral-100">Menu</span>
                <button
                  type="button"
                  className="font-brand text-fp-caption uppercase text-hcode-muted transition-colors hover:text-brand-fg"
                  onClick={() => setDrawer(false)}
                >
                  Close
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">{navLinks}</nav>
              <div className="border-t border-[var(--card-border)] p-3 dark:border-neutral-700/70">
                <button type="button" className="hcode-btn-outline mb-2 w-full py-2.5 font-brand text-fp-caption" onClick={signOut}>
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
