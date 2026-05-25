"use client";

import type { PaginatedMeta } from "@/api/client";
import type { CertificationListRow } from "@/api/certifications";
import { SlugHoverGridCard } from "@/components/card";
import { coverForCertification } from "@/components/content/cardCovers";
import { useInfinitePublicList } from "@/components/content/useInfinitePublicList";
import { excerptPlain, SLUG_HOVER_GRID_DESCRIPTION_MAX } from "@/lib/html-plain";

const LIMIT = 12;
const PATH = "/certifications";

export function CertificationsCardFeed(props: { initial: { items: CertificationListRow[]; meta: PaginatedMeta } }) {
  const { items, meta, sentinelRef } = useInfinitePublicList<CertificationListRow>(
    PATH,
    LIMIT,
    props.initial,
  );

  return (
    <>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {items.map((c, i) => {
          const excerpt = excerptPlain(c.detail, SLUG_HOVER_GRID_DESCRIPTION_MAX);
          return (
            <SlugHoverGridCard
              key={c.id}
              href={`/certifications/${c.slug}`}
              title={c.heading}
              description={excerpt}
              imageUrl={coverForCertification(c)}
              delay={Math.min(i * 0.045, 0.32)}
            />
          );
        })}
        <div ref={sentinelRef} className="col-span-full min-h-[32px] w-full" aria-hidden />
      </div>
      {meta.page < meta.totalPages ? (
        <p className="mt-8 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-secondary">Scroll for more</p>
      ) : null}
    </>
  );
}
