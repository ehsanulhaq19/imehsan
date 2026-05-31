"use client";

import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/api/client";
import { ScrollReveal } from "@/components/content/ScrollReveal";

function VideoGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function FooterNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-mr-0.5 inline-flex items-center gap-2 rounded-sm px-2 py-1.5 font-brand-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-tertiary outline-none ring-offset-2 ring-offset-white transition-colors hover:text-brand-fg focus-visible:ring-2 focus-visible:ring-brand-tertiary/55 dark:ring-offset-neutral-100"
      aria-label={`Open: ${label}`}
    >
      Open
      <span aria-hidden className="inline-block translate-y-px">
        →
      </span>
    </Link>
  );
}

function OverlayWhitePanel({
  title,
  blurb,
  href,
  compact,
}: {
  title: string;
  blurb?: string;
  href: string;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white/[0.97] text-brand-fg dark:bg-neutral-100">
      <header
        className={`shrink-0 border-b border-brand-fg/[0.08] dark:border-neutral-950/10 ${
          compact ? "px-3 pb-2.5 pt-3" : "px-5 pb-4 pt-5"
        }`}
      >
        <p
          className={`line-clamp-3 font-brand font-bold uppercase leading-snug tracking-[0.06em] text-brand-fg ${
            compact ? "text-[11px]" : "text-sm"
          }`}
        >
          {title}
        </p>
      </header>

      <div className={`min-h-0 flex-1 overflow-y-auto ${compact ? "px-3 py-3" : "px-5 py-6"}`}>
        {blurb ? (
          <p
            className={`whitespace-pre-wrap break-words font-brand font-light leading-relaxed text-neutral-700 [overflow-wrap:anywhere] ${
              compact ? "text-[11px]" : "text-[13px]"
            }`}
          >
            {blurb}
          </p>
        ) : null}
      </div>

      <footer
        className={`flex shrink-0 flex-row items-center justify-end border-t border-brand-fg/[0.08] dark:border-neutral-950/10 ${
          compact ? "px-3 pb-3 pt-2.5" : "px-5 pb-5 pt-4"
        }`}
      >
        <FooterNavLink href={href} label={title} />
      </footer>
    </div>
  );
}

export type SlugHoverGridCardProps = {
  href: string;
  title: string;
  description?: string | null;
  /** Storage path; passed through `assetUrl`. */
  imageUrl?: string | null;
  videoUrl?: string | null;
  delay?: number;
  className?: string;
  /** Denser thumbnail + overlay typography for masonry-style landing grids */
  density?: "default" | "compact";
  showVideoBadge?: boolean;
  /** First visible image above the fold (e.g. landing hero grid). */
  imagePriority?: boolean;
};

export function SlugHoverGridCard({
  href,
  title,
  description,
  imageUrl,
  videoUrl,
  delay = 0,
  className,
  density = "default",
  showVideoBadge = true,
  imagePriority = false,
}: SlugHoverGridCardProps) {
  const compact = density === "compact";
  const hasImagePath = Boolean(imageUrl?.trim());
  const hasVid = Boolean(videoUrl?.trim());
  const hasMedia = hasImagePath || hasVid;
  const img = hasImagePath ? assetUrl(imageUrl!.trim()) : undefined;
  const vid = hasVid ? assetUrl(videoUrl!.trim()) : undefined;
  const blurb = description?.trim() || undefined;

  return (
    <ScrollReveal delay={delay} className={className}>
      <article
        className={`overflow-hidden rounded-xl border border-brand-outline-soft/35 bg-brand-surface-low/30 shadow-[0_22px_50px_-32px_rgb(11_28_48_/0.55)] transition-transform duration-300 hover:-translate-y-1 ${compact ? "rounded-lg" : ""}`}
      >
        <div className="group block">
          <div
            className={`relative isolate w-full overflow-hidden bg-neutral-900/10 ${compact ? "aspect-[16/11]" : "aspect-[5/5]"}`}
          >
            {hasMedia ? (
              <>
                {hasVid ? (
                  <video
                    src={vid}
                    muted
                    playsInline
                    preload="metadata"
                    poster={img}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                ) : (
                  <Image
                    src={img!}
                    alt=""
                    fill
                    priority={imagePriority}
                    className="object-unset transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    sizes={compact ? "(max-width:640px) 100vw, (max-width:1024px) 33vw, 25vw" : "(max-width:640px) 100vw, 50vw"}
                    unoptimized
                  />
                )}

                {hasVid && showVideoBadge ? (
                  <span
                    className={`pointer-events-none absolute right-2 top-2 z-[5] flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm ${
                      compact ? "h-7 w-7" : "h-9 w-9"
                    }`}
                  >
                    <VideoGlyph className={compact ? "h-3 w-3" : "h-4 w-4"} />
                  </span>
                ) : null}

                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 z-[6] bg-gradient-to-t from-black/82 via-black/38 to-transparent ${
                    compact ? "px-3 pb-3 pt-9" : "px-4 pb-4 pt-14"
                  }`}
                >
                  <p
                    className={`font-brand font-bold uppercase leading-tight tracking-[0.05em] text-white drop-shadow-sm ${
                      compact ? "line-clamp-1 text-[11px]" : "line-clamp-2 text-sm"
                    }`}
                  >
                    {title}
                  </p>
                </div>

                <div className="pointer-events-none invisible absolute inset-0 z-10 flex translate-y-full flex-col transition-[transform,visibility] duration-300 ease-out group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0">
                  <OverlayWhitePanel compact={compact} href={href} title={title} blurb={blurb} />
                </div>
              </>
            ) : (
              <OverlayWhitePanel compact={compact} href={href} title={title} blurb={blurb} />
            )}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}
