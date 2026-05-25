"use client";

import type { PaginatedMeta } from "@/api/client";
import type { VlogListRow } from "@/api/vlogs";
import { SlugHoverGridCard } from "@/components/card";
import { coverForVlog } from "@/components/content/cardCovers";
import { useInfinitePublicList } from "@/components/content/useInfinitePublicList";
import { excerptPlain, SLUG_HOVER_GRID_DESCRIPTION_MAX } from "@/lib/html-plain";

const LIMIT = 12;
const PATH = "/vlogs";

export function VlogsCardFeed(props: { initial: { items: VlogListRow[]; meta: PaginatedMeta } }) {
  const { items, meta, sentinelRef } = useInfinitePublicList<VlogListRow>(PATH, LIMIT, props.initial);

  return (
    <>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {items.map((v, i) => {
          const excerpt = excerptPlain(v.description, SLUG_HOVER_GRID_DESCRIPTION_MAX);
          const { video: videoPath, image: thumbPath } = coverForVlog(v);
          return (
            <SlugHoverGridCard
              key={v.id}
              href={`/vlogs/${v.slug}`}
              title={v.heading}
              description={excerpt}
              imageUrl={thumbPath}
              videoUrl={videoPath}
              delay={Math.min(i * 0.045, 0.35)}
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
