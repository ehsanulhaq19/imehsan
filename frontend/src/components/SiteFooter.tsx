"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { assetUrl, apiBase } from "@/api/client";
import type { SocialLinkRow } from "@/api/social-links";

const quick = [
  { href: "/projects", label: "Projects" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/certifications", label: "Certifications" },
  { href: "/git-repos", label: "Git" },
  { href: "/vlogs", label: "Vlogs" },
  { href: "/booking", label: "Booking" },
];

export function SiteFooter() {
  const [social, setSocial] = useState<SocialLinkRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`${apiBase}/social-links`)
      .then((res) => (res.ok ? res.json() : Promise.resolve([])))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setSocial(data as SocialLinkRow[]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="border-t border-hcode-border bg-[#f4f4f4]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="max-w-md">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-black">Ehsan Ul Haq</p>
            <p className="mt-3 text-sm leading-[1.65] text-hcode-muted">
              Full-stack engineer with 7+ years shipping Next, Node, NestJS, Django, and Laravel systems. Strong backend
              architecture, crisp frontends, DevOps, and cloud—plus hands-on AI integration for assistants, search, and
              multi-provider platforms.
            </p>
            {social.length ? (
              <ul className="mt-6 flex flex-wrap items-center gap-4" aria-label="Social profiles">
                {social.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-black transition-opacity hover:opacity-70"
                      title={s.name}
                    >
                      <img src={assetUrl(s.iconUrl)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                      <span className="sr-only">{s.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <nav className="flex flex-col gap-2 md:items-end">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-black">Explore</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              {quick.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[11px] font-semibold uppercase tracking-wider text-hcode-muted hover:text-black"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-12 text-center text-[11px] uppercase tracking-[0.2em] text-hcode-muted">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
