import { type PaginatedResult, fetchJson, fetchJsonPaginated } from "./client";

export type ProjectListRow = {
  id: string;
  slug: string;
  heading: string;
  details?: string | null;
  coverImageUrl?: string | null;
  projectMedia?: { role: string; media: { path: string; mimeType: string } }[];
};

const defaultListLimit = 12;

export async function fetchProjectsPage(page = 1, limit = defaultListLimit) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchJsonPaginated<ProjectListRow>(`/projects?${q}`, page, limit);
}

export function fetchProjectBySlug<T>(slug: string) {
  return fetchJson<T>(`/projects/${slug}`);
}
