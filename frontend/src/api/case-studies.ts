import { fetchJson } from "./client";

export function fetchCaseStudiesList<T>() {
  return fetchJson<T>("/case-studies");
}

export function fetchCaseStudyBySlug<T>(slug: string) {
  return fetchJson<T>(`/case-studies/${slug}`);
}
