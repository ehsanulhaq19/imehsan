"use client";

import type { PaginatedMeta } from "@/api/client";
import { fetchJsonPaginatedNoStore } from "@/api/client";
import { useCallback, useEffect, useRef, useState } from "react";

function buildPath(basePath: string, page: number, limit: number) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return `${basePath}?${q}`;
}

export function useInfinitePublicList<T>(
  basePath: string,
  limit: number,
  initial: { items: T[]; meta: PaginatedMeta },
) {
  const [items, setItems] = useState(initial.items);
  const [meta, setMeta] = useState(initial.meta);
  const busy = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    const m = metaRef.current;
    if (m.page >= m.totalPages) return;
    busy.current = true;
    const nextPage = m.page + 1;
    const path = buildPath(basePath, nextPage, limit);
    try {
      const res = await fetchJsonPaginatedNoStore<T>(path, nextPage, limit);
      if (!res) return;
      setItems((prev) => {
        const seen = new Set(
          prev
            .map((row) => (row as { id?: unknown }).id)
            .filter((id): id is string => typeof id === "string"),
        );
        const batch = res.items ?? [];
        const appended = batch.filter((row) => {
          const id = (row as { id?: unknown }).id;
          if (typeof id !== "string") return true;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return appended.length ? [...prev, ...appended] : prev;
      });
      setMeta(res.meta);
    } finally {
      busy.current = false;
    }
  }, [basePath, limit]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || busy.current) return;
    const m = metaRef.current;
    if (m.page >= m.totalPages) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 480) void loadMore();
  }, [items.length, meta.page, meta.totalPages, loadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root: null, rootMargin: "640px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  useEffect(() => {
    const onScroll = () => {
      const el = sentinelRef.current;
      if (!el || busy.current) return;
      const m = metaRef.current;
      if (m.page >= m.totalPages) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 400) void loadMore();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  return { items, meta, sentinelRef };
}
