import { type PaginatedResult, fetchJson, fetchJsonPaginated } from "./client";

export type CertificationListRow = {
  id: string;
  slug: string;
  heading: string;
  detail?: string | null;
  linkUrl?: string | null;
  thumbnailUrl?: string | null;
  coverImageUrl?: string | null;
};

const defaultListLimit = 12;

export async function fetchCertificationsPage(page = 1, limit = defaultListLimit) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchJsonPaginated<CertificationListRow>(`/certifications?${q}`, page, limit);
}

export function fetchCertificationBySlug<T>(slug: string) {
  return fetchJson<T>(`/certifications/${encodeURIComponent(slug)}`);
}
