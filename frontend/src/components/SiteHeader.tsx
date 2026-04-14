"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/certifications", label: "Certifications" },
  { href: "/git-repos", label: "Repositories" },
  { href: "/vlogs", label: "Vlogs" },
  { href: "/booking", label: "Book" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hcode-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link
          href="/"
          className="font-display text-base font-semibold uppercase tracking-[0.2em] text-black md:text-lg"
        >
          Ehsan Ul Haq
        </Link>
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1 border border-hcode-border md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="block h-px w-5 bg-black" />
          <span className="block h-px w-5 bg-black" />
          <span className="block h-px w-5 bg-black" />
        </button>
        <nav
          className={`absolute left-0 right-0 top-full flex-col gap-0 border-b border-hcode-border bg-white px-4 py-3 md:static md:flex md:flex-row md:border-0 md:bg-transparent md:py-0 ${
            open ? "flex" : "hidden md:flex"
          }`}
        >
          {nav.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`border-t border-hcode-border py-3 text-[11px] font-semibold uppercase tracking-[0.15em] first:border-t-0 md:border-0 md:py-0 md:pl-6 ${
                  active ? "text-hcode-violet" : "text-black hover:text-hcode-violet"
                }`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
