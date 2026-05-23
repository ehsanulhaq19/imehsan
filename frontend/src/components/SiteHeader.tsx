"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { content } from "@/lib/content-registry";

const { site } = content;
const nav = site.nav;
const h = site.header;

function IconBars({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] border-b border-brand-outline-soft/20 bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-page-x py-4 md:gap-10 md:px-page-x-md md:py-6">
        <div className="flex min-w-0 flex-1 items-center gap-5 md:gap-12">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-brand-outline-soft/50 text-brand-fg transition-colors hover:border-brand-fg/30 hover:bg-brand-surface-low md:hidden"
            aria-label={drawerOpen ? h.menuClose : h.menuOpen}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            {drawerOpen ? <IconX className="h-5 w-5" /> : <IconBars className="h-6 w-6" />}
          </button>
          <Link href="/" className="truncate font-brand-display text-fp-card font-bold text-brand-fg md:text-fp-sub">
            {site.brandWordmark}
          </Link>
          <nav className="ml-auto hidden items-center gap-8 lg:gap-10 md:flex" aria-label={h.primaryNavLabel}>
            {nav.slice(1).map(({ href, label }) => {
              const active = navActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`font-brand text-fp-nav font-medium transition-colors ${
                    active
                      ? "border-b-2 border-brand-fg pb-0.5 text-brand-fg"
                      : "text-brand-secondary hover:text-brand-fg"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/booking"
          className="shrink-0 bg-brand-secondary px-4 py-2.5 text-center font-brand text-fp-button font-semibold uppercase text-white transition-opacity hover:opacity-85 sm:px-6 sm:py-3"
        >
          {h.consultationCta}
        </Link>
      </div>

      {drawerOpen ? (
        <>
          <div role="presentation" className="fixed inset-x-0 bottom-0 top-[4.375rem] z-[90] bg-brand-fg/25 backdrop-blur-[2px] md:hidden" onClick={closeDrawer} />
          <nav className="site-drawer-panel fixed bottom-0 left-0 top-[4.375rem] z-[95] flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-r border-brand-outline-soft/35 bg-brand-bg/96 px-7 py-8 shadow-xl backdrop-blur-xl md:hidden">
            <p className="font-brand-mono text-[10px] uppercase tracking-[0.28em] text-brand-muted/80">{h.drawerKicker}</p>
            <ul className="mt-8 flex flex-col gap-1">
              {nav.map(({ href, label }) => {
                const active = navActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block py-3.5 font-brand text-fp-nav font-medium transition-colors ${
                        active ? "text-brand-tertiary" : "text-brand-secondary hover:text-brand-fg"
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={closeDrawer}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      ) : null}
    </header>
  );
}
