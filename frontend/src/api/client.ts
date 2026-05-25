const rawBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001";

export const apiOrigin = rawBase;

export const apiBase = `${rawBase}/api`;

export function assetUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBase}${path}`, init);
}

export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<T> = { items: T[]; meta: PaginatedMeta };

export function normalizePaginatedResponse<T>(
  raw: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): PaginatedResult<T> | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const total = raw.length;
    const lim = Math.max(fallbackLimit, 1);
    const start = Math.max(0, (fallbackPage - 1) * lim);
    const slice = (raw as T[]).slice(start, start + lim);
    const totalPages = Math.max(1, Math.ceil(total / lim));
    return {
      items: slice,
      meta: {
        total,
        page: fallbackPage,
        limit: lim,
        totalPages,
      },
    };
  }
  if (typeof raw !== "object") return null;
  const o = raw as { items?: unknown; meta?: unknown };
  const items = Array.isArray(o.items) ? (o.items as T[]) : [];
  const m = o.meta && typeof o.meta === "object" && o.meta !== null ? (o.meta as Partial<PaginatedMeta>) : {};
  const total = typeof m.total === "number" ? m.total : items.length;
  const page = typeof m.page === "number" ? m.page : fallbackPage;
  const lim = typeof m.limit === "number" ? m.limit : fallbackLimit;
  const totalPages =
    typeof m.totalPages === "number"
      ? m.totalPages
      : Math.max(1, Math.ceil(total / Math.max(lim, 1)));
  return { items, meta: { total, page, limit: lim, totalPages } };
}

export async function fetchJsonPaginated<T>(
  pathWithQuery: string,
  page: number,
  limit: number,
  init?: RequestInit,
): Promise<PaginatedResult<T> | null> {
  const raw = await fetchJson<unknown>(pathWithQuery, init);
  return normalizePaginatedResponse<T>(raw, page, limit);
}

export async function fetchJsonPaginatedNoStore<T>(
  pathWithQuery: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<T> | null> {
  const raw = await fetchJsonNoStore<unknown>(pathWithQuery);
  return normalizePaginatedResponse<T>(raw, page, limit);
}

export async function fetchJsonNoStore<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
