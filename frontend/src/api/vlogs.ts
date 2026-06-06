import { type PaginatedResult, fetchApi, fetchJson, fetchJsonPaginated } from "./client";

export type VlogListRow = {
  id: string;
  slug: string;
  heading: string;
  description?: string | null;
  mediaItems?: {
    role: string;
    order?: number;
    type?: string;
    isPublicView?: boolean;
    media: { path: string; mimeType: string };
  }[];
};

const defaultListLimit = 12;

export async function fetchVlogsPage(page = 1, limit = defaultListLimit) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchJsonPaginated<VlogListRow>(`/vlogs?${q}`, page, limit);
}

export function fetchVlogBySlug<T>(slug: string) {
  return fetchJson<T>(`/vlogs/${slug}`);
}

export function submitVlogVote(slug: string, body: { visitorKey: string; value: number }) {
  return fetchApi(`/vlogs/${slug}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function submitVlogComment(
  slug: string,
  body: { body: string; authorName?: string },
) {
  return fetchApi(`/vlogs/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
