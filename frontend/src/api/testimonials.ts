import { fetchJson, fetchJsonPaginated, type PaginatedResult } from "./client";

export type TestimonialRow = {
  id: string;
  authorName: string;
  quote: string;
  coverImageUrl?: string | null;
  images?: { media: { path: string; mimeType: string } }[];
};

const defaultListLimit = 12;

export function fetchTestimonialsList<T>() {
  return fetchJson<T>("/testimonials");
}

export function fetchTestimonialsPage(page = 1, limit = defaultListLimit) {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  return fetchJsonPaginated<TestimonialRow>(`/testimonials?${q}`, page, limit);
}

export type { PaginatedResult };
