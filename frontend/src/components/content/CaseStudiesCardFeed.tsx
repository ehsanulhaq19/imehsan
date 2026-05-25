"use client";

import type { PaginatedMeta } from "@/api/client";
import { SlugHoverGridCard } from "@/components/card";
import { coverForCaseStudy, type CaseStudyCardRow } from "@/components/content/cardCovers";
import { useInfinitePublicList } from "@/components/content/useInfinitePublicList";
import { excerptPlain, SLUG_HOVER_GRID_DESCRIPTION_MAX } from "@/lib/html-plain";

const LIMIT = 12;
const PATH = "/case-studies";

type Row = CaseStudyCardRow & { id: string; slug: string; title: string; description?: string | null };

export function CaseStudiesCardFeed(props: { initial: { items: Row[]; meta: PaginatedMeta } }) {
  const { items, meta, sentinelRef } = useInfinitePublicList<Row>(PATH, LIMIT, props.initial);

  return (
    <>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {items.map((c, i) => {
          const excerpt = excerptPlain(c.description, SLUG_HOVER_GRID_DESCRIPTION_MAX);
          const img = coverForCaseStudy(c);
          return (
            <SlugHoverGridCard
              key={c.id}
              href={`/case-studies/${c.slug}`}
              title={c.title}
              description={excerpt}
              imageUrl={img}
              delay={Math.min(i * 0.04, 0.28)}
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
