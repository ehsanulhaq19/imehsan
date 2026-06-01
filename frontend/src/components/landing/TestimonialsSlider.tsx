"use client";

import type { PaginatedMeta } from "@/api/client";
import { assetUrl, fetchJsonPaginatedNoStore } from "@/api/client";
import type { TestimonialRow } from "@/api/testimonials";
import { coverForTestimonial } from "@/components/content/cardCovers";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const ITEMS_PER_SLIDE = 3;
const AUTO_INTERVAL_MS = 7000;

export type TestimonialSlideItem = {
  id: string;
  authorName: string;
  quote: string;
  image?: string;
};

type SlideCache = Map<number, TestimonialSlideItem[]>;

function mapRows(rows: TestimonialRow[]): TestimonialSlideItem[] {
  return rows.map((t) => ({
    id: t.id,
    authorName: t.authorName,
    quote: t.quote,
    image: coverForTestimonial(t),
  }));
}

function buildPath(page: number) {
  const q = new URLSearchParams({ page: String(page), limit: String(ITEMS_PER_SLIDE) });
  return `/testimonials?${q}`;
}

function TestimonialCard({ item }: { item: TestimonialSlideItem }) {
  const img = item.image ? assetUrl(item.image) : null;

  return (
    <blockquote className="card-3d-tilt flex h-full flex-col break-inside-avoid rounded-2xl border border-brand-outline-soft/25 bg-brand-white/[0.93] shadow-[0_30px_70px_-42px_rgb(11_28_48_/0.52)]">
      {img ? (
        <div className="relative aspect-[16/11] bg-brand-muted/10">
          <Image src={img} alt="" fill className="object-cover" sizes="360px" unoptimized />
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-brand-tertiary/15 to-brand-bg" />
      )}
      <div className="flex flex-1 flex-col justify-between space-y-5 p-9">
        <p className="font-brand-accent text-fp-body font-light italic leading-relaxed text-brand-muted">&ldquo;{item.quote}&rdquo;</p>
        <footer className="flex items-center gap-3 border-t border-brand-outline-soft/30 pt-5 font-brand-mono text-fp-tag font-medium uppercase tracking-[0.06em] text-brand-tertiary">
          <span className="h-px flex-1 bg-brand-outline-soft/40" aria-hidden />
          {item.authorName}
        </footer>
      </div>
    </blockquote>
  );
}

export function TestimonialsSlider({
  emptyMessage,
  initial,
}: {
  emptyMessage: string;
  initial?: { items: TestimonialSlideItem[]; meta: PaginatedMeta } | null;
}) {
  const reduce = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(initial?.meta.totalPages ?? 1);
  const [items, setItems] = useState<TestimonialSlideItem[]>(initial?.items ?? []);
  const [loading, setLoading] = useState(!initial?.items.length);
  const [empty, setEmpty] = useState(false);
  const cacheRef = useRef<SlideCache>(new Map(initial?.items.length ? [[1, initial.items]] : []));
  const busyRef = useRef(false);

  const fetchSlide = useCallback(async (page: number) => {
    if (cacheRef.current.has(page)) {
      return cacheRef.current.get(page)!;
    }
    const res = await fetchJsonPaginatedNoStore<TestimonialRow>(buildPath(page), page, ITEMS_PER_SLIDE);
    if (!res?.items.length) return [];
    const mapped = mapRows(res.items);
    cacheRef.current.set(page, mapped);
    setTotalPages(Math.max(1, res.meta.totalPages));
    return mapped;
  }, []);

  const goToSlide = useCallback(
    async (nextIndex: number) => {
      if (busyRef.current || empty) return;
      busyRef.current = true;
      setLoading(true);
      try {
        const pages = Math.max(1, totalPages);
        const wrapped = ((nextIndex % pages) + pages) % pages;
        const page = wrapped + 1;
        const slideItems = await fetchSlide(page);
        if (!slideItems.length) {
          cacheRef.current.clear();
          setSlideIndex(0);
          setTotalPages(1);
          const restart = await fetchSlide(1);
          if (!restart.length) {
            setEmpty(true);
            setItems([]);
            return;
          }
          setItems(restart);
          return;
        }
        setItems(slideItems);
        setSlideIndex(wrapped);
      } finally {
        setLoading(false);
        busyRef.current = false;
      }
    },
    [empty, fetchSlide, totalPages],
  );

  useEffect(() => {
    if (initial?.items.length) {
      cacheRef.current.set(1, initial.items);
      setItems(initial.items);
      setTotalPages(Math.max(1, initial.meta.totalPages));
      setLoading(false);
      return;
    }
    void goToSlide(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once; further slides fetch on navigation
  }, []);

  useEffect(() => {
    if (reduce || empty || totalPages <= 1) return;
    const t = window.setInterval(() => {
      void goToSlide(slideIndex + 1);
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [empty, goToSlide, reduce, slideIndex, totalPages]);

  if (empty) {
    return <p className="font-brand text-brand-secondary">{emptyMessage}</p>;
  }

  if (!items.length && loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-busy="true" aria-label="Loading testimonials">
        {Array.from({ length: ITEMS_PER_SLIDE }).map((_, i) => (
          <div key={i} className="h-[22rem] animate-pulse rounded-2xl border border-brand-outline-soft/20 bg-brand-white/60" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative" aria-roledescription="carousel" aria-label="Client testimonials">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slideIndex}
          initial={reduce ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -28 }}
          transition={{ duration: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          className={`grid grid-cols-1 gap-6 md:grid-cols-3 ${loading ? "pointer-events-none opacity-70" : ""}`}
          aria-live="polite"
        >
          {items.map((t) => (
            <TestimonialCard key={t.id} item={t} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 ? (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={`Show testimonial slide ${i + 1} of ${totalPages}`}
                onClick={() => void goToSlide(i)}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === slideIndex ? "w-8 bg-brand-tertiary" : "w-1.5 bg-brand-fg/25 hover:bg-brand-fg/40"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() => void goToSlide(slideIndex - 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-outline-soft/40 bg-brand-white/80 text-brand-fg transition-colors hover:border-brand-tertiary/50 hover:text-brand-tertiary"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
              onClick={() => void goToSlide(slideIndex + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-outline-soft/40 bg-brand-white/80 text-brand-fg transition-colors hover:border-brand-tertiary/50 hover:text-brand-tertiary"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
