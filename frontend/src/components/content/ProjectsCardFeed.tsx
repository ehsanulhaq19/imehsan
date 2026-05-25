"use client";

import type { PaginatedMeta } from "@/api/client";
import type { ProjectListRow } from "@/api/projects";
import { SlugHoverGridCard } from "@/components/card";
import { useInfinitePublicList } from "@/components/content/useInfinitePublicList";
import { excerptPlain, SLUG_HOVER_GRID_DESCRIPTION_MAX } from "@/lib/html-plain";

const LIMIT = 12;
const PATH = "/projects";

export function ProjectsCardFeed(props: { initial: { items: ProjectListRow[]; meta: PaginatedMeta } }) {
  const { items, meta, sentinelRef } = useInfinitePublicList<ProjectListRow>(PATH, LIMIT, props.initial);

  return (
    <>
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {items.map((p, i) => {
          const excerpt = excerptPlain(p.details, SLUG_HOVER_GRID_DESCRIPTION_MAX);
          const pm = p.projectMedia ?? [];
          const vid = pm.find((m) => m.media.mimeType.startsWith("video"));
          const poster =
            p.coverImageUrl?.trim() ||
            pm.find((m) => m.media.mimeType.startsWith("image"))?.media.path ||
            undefined;
          return (
            <SlugHoverGridCard
              key={p.id}
              href={`/projects/${p.slug}`}
              title={p.heading}
              description={excerpt}
              imageUrl={poster}
              videoUrl={vid?.media.path}
              delay={Math.min(i * 0.04, 0.3)}
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
