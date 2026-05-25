import { type PaginatedResult, fetchJson, fetchJsonPaginated } from "./client";

const defaultListLimit = 12;

export async function fetchCaseStudiesPage<T>(
  page = 1,
  limit = defaultListLimit,
): Promise<PaginatedResult<T> | null> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return fetchJsonPaginated<T>(`/case-studies?${q}`, page, limit);
}

export function fetchCaseStudyBySlug<T>(slug: string) {
  return fetchJson<T>(`/case-studies/${slug}`);
}
